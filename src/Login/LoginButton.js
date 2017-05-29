import React, { Component } from 'react';

function LoginButton(props) {
  return (
    <button onClick={props.onClick}>
      Login with Facebook
    </button>
  );
}

export default LoginButton;
