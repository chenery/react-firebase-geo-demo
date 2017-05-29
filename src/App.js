import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './Login/Login';
import Location from './Location/Location';
import {UserStore} from './Firebase/Firebase';

class App extends Component {

  constructor(props) {
    super(props);

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);

    // isLoggedIn is a top level state, and passed down into child components
    this.state = {isLoggedIn: false};
  }

  onLogin(loggedInUser) {
    console.log('App has seen login');
    // TODO is it possible to auto save based on state?
    UserStore.saveUser(loggedInUser.email, loggedInUser.displayName, loggedInUser.photoURL)
      .then(user => {
        console.log('User saved after login, logged in App state');
        this.setState({
          isLoggedIn: true,
          user: user
        });
      });
  }

  onLogout() {
    this.setState({isLoggedIn: false});
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Login isLoggedIn={isLoggedIn} onLogin={this.onLogin} onLogout={this.onLogout}/>
        {isLoggedIn && <Location userId={this.state.user.id} />}
      </div>
    );
  }
}

export default App;
