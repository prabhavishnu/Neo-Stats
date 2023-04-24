import React, { Component } from "react";
import Logo from "./asteroids_png.png";

export default class Header extends Component {
  render() {
    return (
      <nav className="navbar">
        <a className="navbar-brand">
          <img
            src={Logo}
            width="50"
            height="50"
            className="d-inline-block mr-2"
            alt=""
          />
          Asteroid - Neo Stats
        </a>
      </nav>
    );
  }
}
