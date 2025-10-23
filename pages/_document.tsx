import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const miniappEmbed = {
    version: "1",
    imageUrl: "https://www.flowpepe.com/logo.png",
    button: {
      title: "WAGMI - Play Now! 🐸",
      action: {
        type: "launch_frame",
        name: "FlowPepe",
        url: "https://www.flowpepe.com",
        splashImageUrl: "https://www.flowpepe.com/logo.png",
        splashBackgroundColor: "#ded895",
      },
    },
  };

  return (
    <Html lang="en">
      <Head>
        {/* Suppress browser extension errors immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress extension errors before React loads
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0]?.toString() || '';
                  if (msg.includes('Could not establish connection') ||
                      msg.includes('Receiving end does not exist') ||
                      msg.includes('runtime.lastError')) {
                    return;
                  }
                  originalError.apply(console, args);
                };

                window.addEventListener('unhandledrejection', function(e) {
                  const reason = e.reason?.toString() || '';
                  if (reason.includes('Could not establish connection') ||
                      reason.includes('Receiving end does not exist')) {
                    e.preventDefault();
                  }
                });
              })();
            `,
          }}
        />

        {/* Farcaster Mini App Meta Tags */}
        <meta
          property="fc:miniapp"
          content={JSON.stringify(miniappEmbed)}
        />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://www.flowpepe.com/logo.png" />
        <meta property="fc:frame:button:1" content="Play FlowPepe" />
        <meta property="fc:frame:button:1:action" content="launch_frame" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="FlowPepe - WAGMI! 🐸" />
        <meta
          property="og:description"
          content="Help Pepe make it through red candlestick obstacles and earn points! The ultimate crypto Flappy Bird on Base. WAGMI! 🚀"
        />
        <meta property="og:image" content="https://www.flowpepe.com/logo.png" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlowPepe - WAGMI! 🐸" />
        <meta
          name="twitter:description"
          content="Help Pepe make it and earn points! Ultimate crypto Flappy Bird on Base. WAGMI! 🚀"
        />
        <meta name="twitter:image" content="https://www.flowpepe.com/logo.png" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
