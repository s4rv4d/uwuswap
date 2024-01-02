import React from "react";
import { useState, useEffect, useContext } from "react";
import { MetaMaskContext } from "../../contexts/MetaMask";

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
  const context = useContext(MetaMaskContext);

  const shortAddress = (address) =>
    address.slice(0, 6) + "..." + address.slice(-4);

  console.log(context);

  return (
    <div className="navbar">
      {/* <div className="left-content">
        {menuItems.map((el, i) => (
          <button key={i + 1} className="left-content-item" onClick={() => {}}>
            {el.name}
          </button>
        ))}
      </div> */}

      <div className="center-space">
        <h1>uWuSwap</h1>
      </div>

      <div className="right-content">
        {context.status === "not_connected" && (
          <button className="connect-button" onClick={context.connect}>
            Connect
          </button>
        )}

        {context.status === "connected" && (
          <button className="connect-button" onClick={() => {}}>
            {shortAddress(context.account)}
          </button>
        )}
      </div>
    </div>
  );
}
