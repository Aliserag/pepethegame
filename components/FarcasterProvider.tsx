import React, { createContext, useContext, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

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
        // Add timeout to prevent hanging when not in Farcaster frame
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Farcaster SDK timeout")), 2000)
        );

        // Race between SDK context and timeout
        const context = await Promise.race([
          sdk.context,
          timeoutPromise
        ]).catch(() => null);

        if (context) {
          setContext(context);

          // Get user information
          if ((context as any)?.user) {
            setUser({
              fid: (context as any).user.fid || null,
              username: (context as any).user.username || null,
              displayName: (context as any).user.displayName || null,
            });
          }
        }

        setIsSDKLoaded(true);

        // Signal that the app is ready (only if in Farcaster frame)
        try {
          sdk.actions.ready();
        } catch {
          // Ignore if not in Farcaster frame
        }
      } catch (error) {
        console.log("Not running in Farcaster frame, continuing without SDK");
        // Still mark as loaded to allow the app to function
        setIsSDKLoaded(true);
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
