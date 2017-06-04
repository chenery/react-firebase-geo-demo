import React, { Component } from 'react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import {FirebaseAuth} from '../Repository/Firebase';
import {UserStore} from '../Repository/Firebase';

/**
 * If logged out:
 *  - display invitation to login and LoginButton
 *
 * If logged in:
 *  - display invitation to login and LoginButton
 **/
class Login extends Component {

  constructor(props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);

    // setup handling of a successful login.
    // TODO consider the effect of the UI here - a user has to wait for firebase
    // to produce the redirect result before showing the user they have logged
    // in.
    FirebaseAuth().getRedirectResult()
      .then(loginResult => this.handleLogin(loginResult))
      .catch(error => {
          console.error('Failed to find auth result: %s', error.message);
      })
  }

  handleLoginClick() {
    var provider = new FirebaseAuth.FacebookAuthProvider();

    provider.addScope('public_profile');
    provider.addScope('user_friends');
    provider.addScope('email');

    FirebaseAuth().signInWithRedirect(provider);
  }

  handleLogoutClick() {
    FirebaseAuth().signOut()
      .then(() => this.props.onLogout());
  }

  handleLogin(loginResult) {
    if (loginResult.credential) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = loginResult.credential.accessToken;
        console.log('Received Facebook access token %s', token);
    }

    // The signed-in user info.
    var user = loginResult.user;
    if (!user) {
      console.log('Not logged in');
      return;
    }

    console.log("*** Logged in as user: " + user.displayName + " ***");

    UserStore.saveUser(user.uid, user.email, user.displayName, user.photoURL)
      .then(user => {
        this.props.onLogin(user);
      });
  }

  render() {
    const isLoggedIn = this.props.isLoggedIn;
    const name = this.props.name;
    let button = null;

    if (isLoggedIn) {
      button = <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
      button = <LoginButton onClick={this.handleLoginClick} />;
    }

    return (
      <div className="LoginControl">
        {isLoggedIn ? (<h3>Logged in as {name}</h3>) : (<h3>Not logged in</h3>)}
        {button}
      </div>
    )
  }

  componentDidMount() {
    console.log('Login component mounted');
  }

  componentWillUnmount() {
    console.log('Login component will unmount');
  }
}

export default Login;
