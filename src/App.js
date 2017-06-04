import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login/Login';
import Location from './Location/Location';
import OnlineUsers from "./Users/OnlineUsers"
import {UserStore} from './Repository/Firebase';
import {FirebaseAuth} from './Repository/Firebase';

class App extends Component {

  constructor(props) {
    super(props);

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLine = this.onLine.bind(this);
    this.offLine = this.offLine.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    // isLoggedIn & isOnline is a top level state,
    // and passed down into child components
    this.state = {
      isLoggedIn: false,
      isOnline: false,
      user: null,
      userLocationPin: null
    };
  }

  componentDidMount() {
    console.log('App did mount');
    FirebaseAuth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, "login without save"
        var userToAutoLogin = {
            "id": user.uid,
            "email": user.emailVerified,
            "name": user.displayName,
            "photoURL": user.photoURL
        };

        console.log("Already logged in as %s", user.uid);

        // TODO init APP state (isOnline) from the DB
        this.setState({
          isLoggedIn: true,
          user: userToAutoLogin
        });
      }
    });
  }

  // TODO init APP state (isOnline) from the DB
  onLogin(loggedInUser) {
    console.log('App has seen new login');
    // TODO actually this looks nicer in a lower component
    UserStore.saveUser(loggedInUser.uid, loggedInUser.email, loggedInUser.displayName, loggedInUser.photoURL)
      .then(user => {
        console.log('User saved after login, logged in App state');
        this.setState({
          isLoggedIn: true,
          user: user
        });
      });
  }

  onLogout() {
    this.setState({
      isLoggedIn: false,
      isOnline: false,
      user: null,
      userLocationPin: null
    });
  }

  onLine(userLocationPin) {
    console.log('App state moving online');
    this.setState({
      isOnline: true,
      userLocationPin: userLocationPin
    });
  }

  offLine() {
    console.log('App state moving offline');
    this.setState({
      isOnline: false,
      userLocationPin: null
    });
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;
    const isOnline = this.state.isLoggedIn && this.state.isOnline;
    const user = this.state.user;
    const name = this.state.user ? this.state.user.name : "Unknown";
    const userLocationPin = this.state.userLocationPin;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Login name={name} isLoggedIn={isLoggedIn} onLogin={this.onLogin} onLogout={this.onLogout}/>
        {isLoggedIn && <Location userId={user.id} isOnline={isOnline} onLine={this.onLine} offLine={this.offLine} />}
        {isOnline && <OnlineUsers userLocationPin={userLocationPin} />}
      </div>
    );
  }
}

export default App;
