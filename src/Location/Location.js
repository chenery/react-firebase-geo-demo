import React, {Component} from 'react';
import {LocationStore} from '../Repository/Firebase';

class Location extends Component {
  constructor(props) {
    super(props);

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  handleOnline() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    // TODO tidy this up to avoid need to that=this
    var that = this;
    navigator.geolocation.getCurrentPosition(function(position) {

      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      console.log("User is located at lat: " + latitude + " lng: " + longitude);

      LocationStore.saveLocation(that.props.userId, latitude, longitude)
        .then(() => {
          that.props.onLine([latitude, longitude]);
        });
    });
  }

  handleOffline() {
    this.props.offLine(this.props.userId);
  }

  render() {
    const isOnline = this.props.isOnline;
    let button = null;

    if (isOnline) {
      button = <button onClick={this.handleOffline}> Hide your location from other users </button>;
    } else {
      button = <button onClick={this.handleOnline}> Show your location to other users </button>;
    }

    return (
      <div className="LocationControl">{button}</div>
    )
  }
}

export default Location;
