import React, { createContext, useContext, useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

interface FarcasterContextType {
  isSDKLoaded: boolean;
  context: any;
  user: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
  };
}

const FarcasterContext = createContext<FarcasterContextType>({
  isSDKLoaded: false,
  context: null,
  user: {
    fid: null,
    username: null,
    displayName: null,
  },
});

export const useFarcaster = () => useContext(FarcasterContext);

export const FarcasterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [user, setUser] = useState<{
    fid: number | null;
    username: string | null;
    displayName: string | null;
  }>({
    fid: null,
    username: null,
    displayName: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        // Initialize the Farcaster SDK
        const context = await sdk.context;
        setContext(context);

        // Get user information
        if (context?.user) {
          setUser({
            fid: context.user.fid || null,
            username: context.user.username || null,
            displayName: context.user.displayName || null,
          });
        }

        setIsSDKLoaded(true);

        // Signal that the app is ready
        sdk.actions.ready();
      } catch (error) {
        console.error("Failed to load Farcaster SDK:", error);
        // Still mark as loaded to allow the app to function
        setIsSDKLoaded(true);
        sdk.actions.ready();
      }
    };

    load();
  }, []);

  return (
    <FarcasterContext.Provider value={{ isSDKLoaded, context, user }}>
      {children}
    </FarcasterContext.Provider>
  );
};
