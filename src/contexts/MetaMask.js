import { createContext, useState } from "react";

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
  const [status, setStatus] = useState("not_connected");
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connect = () => {
    if (typeof window.ethereum == "undefined") {
      return setStatus("not_installed");
    }

    Promise.all([
      window.ethereum.request({ method: "eth_requestAccounts" }),
      window.ethereum.request({ method: "eth_chainId" }),
    ])
      .then(function ([accounts, chainId]) {
        setAccount(accounts[0]);
        setChainId(chainId);
        setStatus("connected");
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const metamaskContext = {
    status,
    account,
    chainId,
    connect,
  };

  return (
    <MetaMaskContext.Provider value={metamaskContext}>
      {children}
    </MetaMaskContext.Provider>
  );
};
