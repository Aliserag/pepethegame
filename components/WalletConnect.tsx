import React, { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const farcasterConnector = connectors.find(
    (connector) => connector.id === "farcasterMiniApp"
  );

  // Auto-connect to Farcaster wallet if in Farcaster Mini App
  useEffect(() => {
    if (farcasterConnector && !isConnected) {
      connect({ connector: farcasterConnector });
    }
  }, [farcasterConnector, isConnected, connect]);

  const handleConnect = () => {
    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="mt-4">
      {isConnected && address ? (
        <button
          onClick={handleDisconnect}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm w-full"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Disconnect: {address.slice(0, 6)}...{address.slice(-4)}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm w-full"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
