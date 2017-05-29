import React, {Component} from 'react';
import {LocationStore} from '../Firebase/Firebase';

class Location extends Component {
  constructor(props) {
    super(props);

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);

    this.state = {isOnline: false};
  }

  handleOnline() {
    this.setState({isOnline: true});

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    // TODO tidy this up to avoid need to that=this
    var that = this;
    navigator.geolocation.getCurrentPosition(function(position) {
        console.log("User is located at lat: " + position.coords.latitude
          + " lng: " + position.coords.longitude);

        LocationStore.saveLocation(that.props.userId, position.coords.latitude,
          position.coords.longitude);
    });
  }

  handleOffline() {
    this.setState({isOnline: false});
    LocationStore.removeLocation(this.props.userId);
  }

  render() {
    const isOnline = this.state.isOnline;
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
