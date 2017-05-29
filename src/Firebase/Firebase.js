import firebase from 'firebase'
import GeoFire from 'geofire'
import {firebaseConfig} from '../config'

firebase.initializeApp(firebaseConfig);
var firebaseDatabase = firebase.database();
var firebaseLocationsRef = firebase.database().ref("locations");
// Create a new GeoFire instance at the random Firebase location
var geoFire = new GeoFire(firebaseLocationsRef);

export const FirebaseAuth = firebase.auth;

export const UserStore = {

  saveUser: function (email, name, photoURL) {
    return new Promise((resolve, reject) => {
      var keyFromEmail = replaceAll(email, '.', '');
      var usersRef = firebaseDatabase.ref("users/" + keyFromEmail);
      var userToSet = {
          "id": keyFromEmail,
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
  }
}

export const LocationStore = {
  saveLocation: function(userId, latitude, longitude) {
    var locationPin = [latitude, longitude];
    var locationKey = getUserRefPath(userId);

    geoFire.set(locationKey, locationPin).then(function () {
        console.log("user location for user: " + locationKey + " set");
    });
  },

  removeLocation: function(userId) {
    var locationKey = getUserRefPath(userId);
    geoFire.remove(locationKey).then(function () {
        console.log("user location removed for user: " + locationKey);
    });
  }
}

function getUserRefPath(userId) {
    return firebaseDatabase.ref("users/" + userId).key;
}

// http://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
