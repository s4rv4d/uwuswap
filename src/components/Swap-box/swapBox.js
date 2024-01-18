import React from "react";
import { useState, useEffect, useContext } from "react";
import "./swapBox.css";
import { MetaMaskContext } from "../../contexts/MetaMask";
import { type } from "@testing-library/user-event/dist/type";
import config from "../../config.js";
import debounce from "../../library/debounce.js";

const { ethers } = require("ethers");

const tokenList = ["WETH", "USDC"];
const uint256Max = ethers.MaxUint256;
const pairs = [["WETH", "USDC"]];

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
  { token0, token1, manager },
  { managerAddress, poolAddress }
) => {
  // making sure token0 and token1 isnt nulls
  if (!token0 || !token1) {
    return;
  }

  const abiCoder = new ethers.AbiCoder();

  // declare variables for test case
  const amount0 = ethers.parseEther("0.998976618347425280"); // WETH
  const amount1 = ethers.parseEther("5000"); // USDC
  const lowerTick = 84222;
  const upperTick = 86129;
  const liquidity = BigInt("1517882343751509868544");
  const extra = abiCoder.encode(
    ["address", "address", "address"],
    [token0.target, token1.target, account]
  );

  Promise.all([
    token0.allowance(account, managerAddress),
    token1.allowance(account, managerAddress),
  ])
    .then(([allowance0, allowance1]) => {
      return Promise.resolve()
        .then(() => {
          if (allowance0 < amount0) {
            return token0
              .approve(managerAddress, amount0)
              .then((tx) => tx.wait())
              .catch((err) => {
                throw new Error(`Error in token0 approve: ${err.message}`);
              });
          }
        })
        .then(() => {
          if (allowance1 < amount1) {
            return token1
              .approve(managerAddress, amount1)
              .then((tx) => tx.wait())
              .catch((err) => {
                throw new Error(`Error in token1 approve: ${err.message}`);
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
  const abiCoder = new ethers.AbiCoder();
  const amountInWei = ethers.parseEther(amountIn);

  const extra = abiCoder.encode(
    ["address", "address", "address"],
    [token0.target, token1.target, account]
  );

  Promise.all([tokenIn.allowance(account, managerAddress)])
    .then(([allowance]) => {
      return Promise.resolve()
        .then(() => {
          if (allowance < amountInWei) {
            return tokenIn
              .approve(managerAddress, amountInWei)
              .then((tx) => tx.wait());
          }
        })
        .then(() => {
          return manager
            .swap(poolAddress, extra)
            .then((tx) => tx.wait())
            .catch((err) => {
              throw new Error(`Error in manager swap: ${err.message}`);
            });
        })
        .then(() => {
          alert("Swap succeeded!");
        });
    })
    .catch((err) => {
      console.error(err);
      alert(`Failed to swap: ${err.message}`);
    });
};

const SwapInput = ({ token, amount, setAmount, disabled, readOnly }) => {
  return (
    <fieldset disabled={disabled}>
      <input
        type="type"
        id={token + "_amount"}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="swap-input"
        placeholder="0.0"
        readOnly={readOnly}
      />
      <label htmlFor={token + "_amount"}>{token}</label>
    </fieldset>
  );
};

const ChangeDirectionButton = ({ zeroForOne, setZeroForOne, disabled }) => {
  return (
    <button
      className=""
      onClick={(e) => {
        e.preventDefault();
        setZeroForOne(!zeroForOne);
      }}
      disabled={disabled}
    >
      🔄
    </button>
  );
};

export default function SwapBox(props) {
  const metamaskContext = useContext(MetaMaskContext);
  const enabled = metamaskContext.status === "connected";

  const pair = pairs[0];

  // just for testing
  // const amount0 = 0.008396714242162444;
  // const amount1 = 42;

  // useState variables
  const [zeroForOne, setZeroForOne] = useState(true);
  const [amount, setAmount] = useState(""); // used for testing
  const [amount0, setAmount0] = useState(0);
  const [amount1, setAmount1] = useState(0);
  const [token0, setToken0] = useState();
  const [token1, setToken1] = useState();
  const [manager, setManager] = useState();
  const [quoter, setQuoter] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // need to rewrite this function need ti async get signer

    const init = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const token0Token = new ethers.Contract(
          config.token0Address,
          config.ABIs.ERC20,
          signer
        );

        const token1Token = new ethers.Contract(
          config.token1Address,
          config.ABIs.ERC20,
          signer
        );

        const managerContract = new ethers.Contract(
          config.managerAddress,
          config.ABIs.Manager,
          signer
        );

        const quoterContract = new ethers.Contract(
          config.quoterAddress,
          config.ABIs.Quoter,
          signer
        );

        setToken0(token0Token);
        setToken1(token1Token);
        setManager(managerContract);
        setQuoter(quoterContract);
      } catch (error) {
        console.error("Error in creating contract: ", error);
      }
    };

    init();
  }, [props.config]);

  const addLiquidity_ = () => {
    addLiquidity(
      metamaskContext.account,
      { token0, token1, manager },
      props.config
    );
  };

  const swap_ = (e) => {
    e.preventDefault();
    swap(
      amount1.toString(),
      metamaskContext.account,
      { tokenIn: token1, manager, token0, token1 },
      props.config
    );
  };

  // helper funcs
  const updateAmountOut = debounce((amount) => {
    if (amount === 0 || amount === "0") {
      return;
    }

    setLoading(true);

    quoter.callStatic
      .quote({
        pool: config.poolAddress,
        amountIn: ethers.parseEther(amount),
        zeroForOne: zeroForOne,
      })
      .then(({ amountOut }) => {
        zeroForOne
          ? setAmount1(ethers.formatEther(amountOut))
          : setAmount0(ethers.formatEther(amountOut));
        setLoading(false);
      })
      .catch((err) => {
        zeroForOne ? setAmount1(0) : setAmount0(0);
        setLoading(false);
        console.error(err);
      });
  });

  const setAmount_ = (setAmountFn) => {
    return (amount) => {
      amount = amount || 0; // null checks
      setAmountFn(amount);
      updateAmountOut(amount);
    };
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
          {/* token0 input */}
          <SwapInput
            amount={zeroForOne ? amount0 : amount1} // token0 (ETH) for token1 (USDC)
            disabled={!enabled || loading}
            readOnly={false}
            setAmount={setAmount_(zeroForOne ? setAmount0 : setAmount1)}
            token={zeroForOne ? pair[0] : pair[1]}
          />

          {/* change */}
          <ChangeDirectionButton
            zeroForOne={zeroForOne}
            setZeroForOne={setZeroForOne}
            disabled={!enabled || loading}
          />

          {/* token1 input */}
          <SwapInput
            amount={zeroForOne ? amount1 : amount0}
            disabled={!enabled || loading}
            readOnly={true}
            token={zeroForOne ? pair[1] : pair[0]}
          />

          {/* swap button */}
          <button
            disabled={!enabled || loading}
            className="swap-action"
            onClick={swap_}
          >
            Swap
          </button>
        </div>
      </div>
    </div>
  );
}

// milestone 1
/* <div className="swap-input-container">
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
          </div> */
