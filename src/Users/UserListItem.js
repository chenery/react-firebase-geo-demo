import React, { Component } from 'react';

class UserListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const name = this.props.name;
    return (
      <li>{name}</li>
    );
  }
}

export default UserListItem;
