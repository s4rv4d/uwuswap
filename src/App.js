import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import SwapBox from "./components/Swap-box/swapBox";
import { MetaMaskProvider } from "./contexts/MetaMask";
import EventsFeed from "./EventsFeed";

// const config = {
//   token0Address: "0x0f5D1ef48f12b6f691401bfe88c2037c690a6afe",
//   token1Address: "0x90118d110B07ABB82Ba8980D1c5cC96EeA810d2C",
//   poolAddress: "0xcA03Dc4665A8C3603cb4Fd5Ce71Af9649dC00d44",
//   managerAddress: "0x2dE080e97B0caE9825375D31f5D0eD5751fDf16D",
//   ABIs: {
//     ERC20: require("./abi/ERC20.json"),
//     Pool: require("./abi/Pool.json"),
//     Manager: require("./abi/Manager.json"),
//   },
// };

function App() {
  return (
    <MetaMaskProvider>
      <div className="App">
        <Navbar />
        <SwapBox />
        <footer>
          <EventsFeed />
        </footer>
      </div>
    </MetaMaskProvider>
  );
}

export default App;
