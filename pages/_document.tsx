import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const miniappEmbed = {
    version: "1",
    imageUrl: "https://your-domain.com/logo.png",
    button: {
      title: "Play FlowPepe",
      action: {
        type: "launch_frame",
        name: "FlowPepe",
        url: "https://your-domain.com",
        splashImageUrl: "https://your-domain.com/logo.png",
        splashBackgroundColor: "#ded895",
      },
    },
  };

  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Mini App Meta Tags */}
        <meta
          property="fc:miniapp"
          content={JSON.stringify(miniappEmbed)}
        />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://your-domain.com/logo.png" />
        <meta property="fc:frame:button:1" content="Play FlowPepe" />
        <meta property="fc:frame:button:1:action" content="launch_frame" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="FlowPepe - Farcaster Mini App" />
        <meta
          property="og:description"
          content="Help Pepe navigate through red candlestick obstacles in this addictive Flappy Bird-style game!"
        />
        <meta property="og:image" content="https://your-domain.com/logo.png" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlowPepe" />
        <meta
          name="twitter:description"
          content="Help Pepe navigate through red candlestick obstacles!"
        />
        <meta name="twitter:image" content="https://your-domain.com/logo.png" />

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
