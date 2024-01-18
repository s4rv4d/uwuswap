import { useContext, useEffect, useReducer, useState } from "react";
import { MetaMaskContext } from "./contexts/MetaMask";
import config from "./config.js";

const { ethers } = require("ethers");
const PoolABI = require("./abi/Pool.json");

const getEvents = (pool) => {
  return Promise.all([
    pool.queryFilter("Mint", "earliest", "latest"),
    pool.queryFilter("Swap", "earliest", "latest"),
  ]).then(([mints, swaps]) => {
    return Promise.resolve((mints || []).concat(swaps || []));
  });
};

const subscribeToEvents = (pool, callback) => {
  pool.once("Mint", (a, b, c, d, e, f, g, event) => callback(event));
  pool.once("Swap", (a, b, c, d, e, f, g, event) => callback(event));
};

const renderAmount = (amount) => {
  return ethers.formatUnits(amount);
};

const renderMint = (args) => {
  return (
    <span>
      <strong>Mint</strong>
      [range: [{args.tickLower}-{args.tickLower}], amounts: [
      {renderAmount(args.amount0)}, {renderAmount(args.amount1)}]]
    </span>
  );
};

const renderSwap = (args) => {
  return (
    <span>
      <strong>Swap</strong>
      [amount0: {renderAmount(args.amount0)}, amount1:{" "}
      {renderAmount(args.amount1)}]
    </span>
  );
};

const renderEvent = (event, i) => {
  let content;

  switch (event) {
    case "Mint":
      content = renderMint(event.args);
      break;
    case "Swap":
      content = renderSwap(event.args);
      break;
  }

  return <li key={i}>{content}</li>;
};

const isMintOrSwap = (event) => {
  return event.event === "Mint" || event.event === "Swap";
};

const cleanEvents = (events) => {
  return events
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .filter((el, i, arr) => {
      return (
        i === 0 ||
        el.blockNumber != arr[i - 1].blockNumber ||
        el.logIndex != arr[i - 1].logIndex
      );
    });
};

const eventsReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return cleanEvents([action.value, ...state]);
    case "set":
      return cleanEvents(action.value);
  }
};

const EventsFeed = (props) => {
  const metamaskContext = useContext(MetaMaskContext);
  const [events, setEvents] = useReducer(eventsReducer, []);
  const [pool, setPool] = useState();

  useEffect(() => {
    if (metamaskContext.status !== "connected") {
      return;
    }

    if (!pool) {
      const newPool = new ethers.Contract(
        config.poolAddress,
        PoolABI,
        new ethers.BrowserProvider(window.ethereum)
      );

      subscribeToEvents(newPool, (event) =>
        setEvents({ type: "add", value: event })
      );

      getEvents(newPool).then((events) => {
        setEvents({ type: "set", value: events });
      });

      setPool(newPool);
    }
  }, [metamaskContext.status, events, pool, config]);

  return <ul>{events.filter(isMintOrSwap).map(renderEvent)}</ul>;
};

export default EventsFeed;
