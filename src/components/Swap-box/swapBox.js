import React from "react";
import { useState, useEffect, useContext } from "react";
import "./swapBox.css";
import { MetaMaskContext } from "../../contexts/MetaMask";

const { ethers } = require("ethers");

const tokenList = ["WETH", "USDC"];

const TokensList = (props) => {
  return (
    <select defaultValue={props.selected} className="swap-dropdown">
      {tokenList.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  );
};

// add liquidity
const addLiquidity = (
  account,
  { fromCurrency, toCurrency, manager },
  { managerAddress, poolAddress }
) => {
  // making sure token0 and token1 isnt nulls
  if (!fromCurrency || !toCurrency) {
    return;
  }

  console.log(fromCurrency.target);
  console.log(toCurrency.target);

  const abiCoder = new ethers.AbiCoder();

  // declare variables for test case
  const amount0 = ethers.parseEther("0.998976618347425280"); // WETH
  const amount1 = ethers.parseEther("5000"); // USDC
  const lowerTick = 84222;
  const upperTick = 86129;
  const liquidity = BigInt("1517882343751509868544");
  const extra = abiCoder.encode(
    ["address", "address", "address"],
    [fromCurrency.target, toCurrency.target, account]
  );

  Promise.all([
    fromCurrency.allowance(account, managerAddress),
    toCurrency.allowance(account, managerAddress),
  ])
    .then(([allowance0, allowance1]) => {
      return Promise.resolve()
        .then(() => {
          if (allowance0.lt(amount0)) {
            return fromCurrency
              .approve(managerAddress, amount0)
              .then((tx) => tx.wait())
              .catch((err) => {
                throw new Error(
                  `Error in fromCurrency approve: ${err.message}`
                );
              });
          }
        })
        .then(() => {
          if (allowance1.lt(amount1)) {
            return toCurrency
              .approve(managerAddress, amount1)
              .then((tx) => tx.wait())
              .catch((err) => {
                throw new Error(`Error in toCurrency approve: ${err.message}`);
              });
          }
        })
        .then(() => {
          return manager
            .mint(poolAddress, lowerTick, upperTick, liquidity, extra)
            .then((tx) => tx.wait())
            .catch((err) => {
              throw new Error(`Error in manager mint: ${err.message}`);
            });
        })
        .then(() => {
          alert("Liquidity added!");
        });
    })
    .catch((err) => {
      console.error(err);
      alert(`Failed to add liquidity: ${err.message}`);
    });
};

// swap function - testing one way swap
const swap = (
  amountIn,
  account,
  { tokenIn, manager, token0, token1 },
  { managerAddress, poolAddress }
) => {
  const amountInWei = ethers.utils.parseEther(amountIn);
  const extra = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [token0.address, token1.address, account]
  );

  tokenIn
    .allowance(account, managerAddress)
    .then((allowance) => {
      if (allowance.lt(amountInWei)) {
        return tokenIn
          .approve(managerAddress, amountInWei)
          .then((tx) => tx.wait());
      }
    })
    .then(() => {
      return manager.swap(poolAddress, extra).then((tx) => tx.wait());
    })
    .then(() => {
      alert("Swap succeeded!");
    })
    .catch((err) => {
      console.error(err);
      alert("Failed!");
    });
};

export default function SwapBox(props) {
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext.status === "connected";

  // just for testing
  const amount0 = 0.008396714242162444;
  const amount1 = 42;

  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState();
  const [toCurrency, setToCurrency] = useState();
  const [manager, setManager] = useState();

  useEffect(() => {
    // need to rewrite this function need ti async get signer
    setFromCurrency(
      new ethers.Contract(
        props.config.token0Address,
        props.config.ABIs.ERC20,
        new ethers.BrowserProvider(window.ethereum).getSigner()
      )
    );
    setToCurrency(
      new ethers.Contract(
        props.config.token1Address,
        props.config.ABIs.ERC20,
        new ethers.BrowserProvider(window.ethereum).getSigner()
      )
    );
    setManager(
      new ethers.Contract(
        props.config.managerAddress,
        props.config.ABIs.Manager,
        new ethers.BrowserProvider(window.ethereum).getSigner()
      )
    );
  }, [props.config]);

  const addLiquidity_ = () => {
    console.log("from: " + fromCurrency);
    console.log("to: " + toCurrency);
    console.log("manager: " + manager);

    // const cn = new ethers.Contract(
    //   props.config.token0Address,
    //   props.config.ABIs.ERC20,
    //   new ethers.BrowserProvider(window.ethereum).getSigner()
    // );
    // console.log(cn.target);

    addLiquidity(
      metamaskContext.account,
      { fromCurrency, toCurrency, manager },
      props.config
    );
  };

  const swap_ = (e) => {
    e.preventDefault();
    swap(
      amount1.toString(),
      metamaskContext.account,
      { tokenIn: fromCurrency, manager, fromCurrency, toCurrency },
      props.config
    );
  };

  return (
    <div className="swap-main-container">
      <div className="swap-container">
        <div className="swap-header">
          <span>Swap</span>
          {/* <span>0.20% slippage</span> */}
          <button disabled={!enabled} onClick={addLiquidity_}>
            Add Liquidity
          </button>
        </div>

        {/* swap body */}
        <div className="swap-body">
          <div className="swap-input-container">
            <input
              type="number"
              value={amount1}
              onChange={(e) => setAmount(e.target.value)}
              className="swap-input"
              placeholder="Enter an amount"
            />

            <TokensList selected="USDC" />
          </div>

          <div className="swap-input-container">
            <input
              type="number"
              value={amount0}
              onChange={(e) => setAmount(e.target.value)}
              className="swap-input"
              placeholder="Enter an amount"
            />

            <TokensList selected="WETH" />
          </div>

          {/* swap button */}
          <button disabled={!enabled} className="swap-action" onClick={swap_}>
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}

// {/* <select
//               value={fromCurrency}
//               onChange={(e) => setFromCurrency(e.target.value)}
//               className="swap-dropdown"
//             >
//               <option>ETH</option>
//               <option>DAI</option>
//               {/* Add other currencies as needed */}
//             </select> */}

// {/* <select
//               value={toCurrency}
//               onChange={(e) => setToCurrency(e.target.value)}
//               className="swap-dropdown"
//             >
//               <option>ETH</option>
//               <option>DAI</option>
//               {/* Add other currencies as needed */}
//             </select> */}
