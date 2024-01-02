import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import SwapBox from "./components/Swap-box/swapBox";
import { MetaMaskProvider } from "./contexts/MetaMask";
import MetaMask from "./components/Metamask";

function App() {
  return (
    <MetaMaskProvider>
      <div className="App">
        <Navbar />
        <SwapBox />
      </div>
    </MetaMaskProvider>
  );
}

export default App;
