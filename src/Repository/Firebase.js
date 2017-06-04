import firebase from 'firebase'
import GeoFire from 'geofire'
import {firebaseConfig} from '../config'

firebase.initializeApp(firebaseConfig);
var firebaseDatabase = firebase.database();
var firebaseLocationsRef = firebase.database().ref("locations");
// Create a new GeoFire instance at the random Firebase location
var geoFire = new GeoFire(firebaseLocationsRef);
// current userQuery
var _userLocationQuery = null;

export const FirebaseAuth = firebase.auth;

export const UserStore = {

  saveUser: function (uid, email, name, photoURL) {
    return new Promise((resolve, reject) => {
      var keyFromEmail = replaceAll(email, '.', '');
      var usersRef = firebaseDatabase.ref("users/" + uid);
      var userToSet = {
          "id": uid,
          "email": email,
          "name": name,
          "photoURL": photoURL
      };
      usersRef.set(userToSet)
        .then(() => {
          console.log("user created/updated: " + email + " with key: "
            + usersRef.key);
          resolve(userToSet);
        });
    });
  },

  cancelFindUsers: function() {
    if (_userLocationQuery) {
      console.log('Cancelling _userLocationQuery');
      _userLocationQuery.cancel();
    }
  },

  // return a promise for an array of users
  findUsers: function(userLocationPin, queryUpdatedCallback) {
    return new Promise((resolve, reject) => {
      // 1. setup query
      var locations = [];
      // cache of users
      var _userMap = {};
      var queryIsComplete = false;
      var start = Date.now();
      var radius = 50;
      console.log("*** Creating GeoQuery for radius " + radius + " and pin "
        + userLocationPin + " ***");

      this.cancelFindUsers();

      _userLocationQuery = geoFire.query({
          center: userLocationPin,
          radius: radius
      });

      _userLocationQuery.on("key_entered", (key, locationPin, distance) => {
        console.log(key + " entered the query. Distance is " + distance + " km");
        var location = {"key": key, "location": locationPin, "distance": distance};
        locations.push(location);

        // 2. load user for location found by query
        loadUser(location.key)
          .then((user) => {
            console.log('user %s loaed from db', user.id);
            _userMap[user.id] = user;

            if (queryIsComplete) {
              // if this is an update to an already completed query, callback
              // to allow re-rendering
              queryUpdatedCallback(processResults(locations, _userMap));

            } else {
              var userMapSize = mapSize(_userMap);
              console.log("locations.length %d, userMapSize size %d", locations.length, userMapSize)
              if (locations.length === userMapSize) {
                // we have all users for locations, the query is done
                // signal find completed
                queryIsComplete = true;
                resolve(processResults(locations, _userMap));
              }
            }
        });
      });

      _userLocationQuery.on("key_exited", function (key, locationPin, distance) {
        console.log(key + " exited the query. Distance is " + distance + " km");

        // remove this location from the locations array, the basis of the query
        locations.forEach(function(location, index) {
            if (location.key === key) {
                locations.splice(index, 1);
            }
        });

        // and remove the corresponding user map
        delete _userMap[key];
        queryUpdatedCallback(processResults(locations, _userMap));
      });

      _userLocationQuery.on("ready", function () {
        var duration = Date.now() - start;
        console.log("*** " + locations.length + " Location records retrieved in "
          + duration + "ms ***");
      });
    });
  }
}

export const LocationStore = {

  getLocation: function(userId) {
    return geoFire.get(userId);
  },

  saveLocation: function(userId, latitude, longitude) {
    return new Promise((resolve, reject) => {
      var locationPin = [latitude, longitude];
      var locationKey = getUserRefPath(userId);

      geoFire.set(locationKey, locationPin)
        .then(function () {
          console.log("user location set for user: " + locationKey);
          resolve();
      });
    });
  },

  removeLocation: function(userId) {
    return new Promise((resolve, reject) => {
      var locationKey = getUserRefPath(userId);
      geoFire.remove(locationKey).then(function () {
          console.log("user location removed for user: " + locationKey);
          resolve();
      });
    });
  }
}

// return a promise for the user object
function loadUser(userId) {
  return new Promise((resolve, reject) => {
    getUserRef(userId).once('value')
      .then(userSnapshot => {
        resolve(userSnapshot.val())
      });
  });
}

/**
* Assume: all users are loaded for each location
*
* 1. order locations
* 2. create an array of users to match the order of the locations
* 3. return the array of users
* @param locations
* @param userMap
*/
function processResults(locations, userMap) {

  // 1. order locations
  // the results appears to be received in the order in which they were entered into the db,
  // rather than ordered from near to far
  locations.sort(function(a, b) {
      if (a.distance === b.distance) {
          return 0;
      }

      if (a.distance < b.distance) {
          return -1;
      } else {
          return 1;
      }
  });

  // 2& 3. create an array of users to match the order of the locations
  return locations.map(function(location) {
      return userMap[location.key];
  });
}

function getUserRefPath(userId) {
    return getUserRef(userId).key;
}

function getUserRef(userId) {
    return firebaseDatabase.ref("users/" + userId);
}

// http://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function mapSize(objectAsMap) {
  var count = 0;
  for (var k in objectAsMap) {
      if (objectAsMap.hasOwnProperty(k)) {
          ++count;
      }
  }
  return count;
}
