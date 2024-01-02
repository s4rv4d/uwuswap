import React from "react";
import { useState, useEffect, useContext } from "react";

import "./swapBox.css";

export default function SwapBox() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("ETH");
  const [toCurrency, setToCurrency] = useState("DAI");

  const handleSwap = () => {
    console.log(`Swapping ${amount} ${fromCurrency} to ${toCurrency}`);
    // Here you would add the logic to perform the swap, potentially using a blockchain API
  };

  return (
    <div className="swap-main-container">
      <div className="swap-container">
        <div className="swap-header">
          <span>Swap</span>
          {/* <span>0.20% slippage</span> */}
        </div>
        <div className="swap-body">
          <div className="swap-input-container">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="swap-input"
              placeholder="Enter an amount"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="swap-dropdown"
            >
              <option>ETH</option>
              <option>DAI</option>
              {/* Add other currencies as needed */}
            </select>
          </div>

          <div className="swap-input-container">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="swap-input"
              placeholder="Enter an amount"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="swap-dropdown"
            >
              <option>ETH</option>
              <option>DAI</option>
              {/* Add other currencies as needed */}
            </select>
          </div>

          {/* Repeat for second currency with toCurrency and setToCurrency */}
          <button className="swap-action" onClick={handleSwap}>
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}
