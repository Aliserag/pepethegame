import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectorList, setShowConnectorList] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter out Flow Wallet and other unwanted connectors
  const filteredConnectors = connectors.filter(
    (connector) =>
      connector.id !== 'flow' &&
      connector.name !== 'Flow Wallet' &&
      connector.id !== 'flowWallet'
  );

  // Debug logging
  useEffect(() => {
    console.log("=== WalletConnect Debug ===");
    console.log("Available connectors:", filteredConnectors.map(c => ({ id: c.id, name: c.name })));
    console.log("Is connected:", isConnected);
    console.log("Address:", address);
    console.log("Connect error:", error);
  }, [filteredConnectors, isConnected, address, error]);

  const farcasterConnector = filteredConnectors.find(
    (connector) => connector.id === "farcasterMiniApp"
  );

  // Auto-connect to Farcaster wallet if in Farcaster Mini App
  useEffect(() => {
    console.log("Auto-connect check:", {
      hasFarcasterConnector: !!farcasterConnector,
      isConnected
    });

    if (farcasterConnector && !isConnected) {
      console.log("Attempting auto-connect to Farcaster...");
      connect({ connector: farcasterConnector });
    }
  }, [farcasterConnector, isConnected, connect]);

  const handleConnect = (connector?: any) => {
    console.log("Connect button clicked");

    if (connector) {
      // Connect with specific connector
      console.log("Connecting with connector:", connector.id);
      connect({ connector });
      setShowConnectorList(false);
    } else if (farcasterConnector) {
      // Try Farcaster first
      console.log("Attempting to connect with Farcaster connector");
      connect({ connector: farcasterConnector });
    } else {
      // Show connector selection modal
      console.log("Showing connector list");
      setShowConnectorList(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Don't render until mounted on client to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="mt-4">
        <button
          disabled
          className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full opacity-50"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Loading...
        </button>
      </div>
    );
  }

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
        <>
          <button
            onClick={() => handleConnect()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm w-full"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Connect Wallet
          </button>

          {/* Connector Selection Modal */}
          {showConnectorList && (
            <div className="mt-3 bg-gray-800 rounded-lg p-3 space-y-2">
              <div className="text-white text-xs mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                Choose Wallet:
              </div>
              {filteredConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-xs text-left"
                >
                  {connector.name}
                </button>
              ))}
              <button
                onClick={() => setShowConnectorList(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-gray-400 font-bold py-2 px-3 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          {error && (
            <div className="mt-2 text-red-400 text-xs break-words">
              Error: {error.message}
            </div>
          )}

          {!farcasterConnector && filteredConnectors.length === 0 && (
            <div className="mt-2 text-yellow-400 text-xs">
              No connectors available
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletConnect;
