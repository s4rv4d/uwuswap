import React from "react";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

// styles
import "./Navbar.css";

export default function Navbar() {
  // memu items
  const menuItems = [
    {
      name: "Swap",
      link: "/",
    },
  ];

  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);

  return (
    <div className="navbar">
      <div className="left-content">
        {menuItems.map((el, i) => (
          <button key={i + 1} className="left-content-item" onClick={() => {}}>
            {el.name}
          </button>
        ))}
      </div>

      <div className="center-space">
        <h1>uWuSwap</h1>
      </div>

      <div className="right-content">
        <button className="connect-button" onClick={() => {}}>
          Connect
        </button>
      </div>
    </div>
  );
}
