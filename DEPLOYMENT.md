# FlowPepe Farcaster Mini App - Deployment Guide

This guide will walk you through deploying FlowPepe as a Farcaster Mini App and getting it listed in the Farcaster app directory.

## Prerequisites

- GitHub account
- Vercel account (free tier works fine)
- Farcaster account with Developer Mode enabled
- Your app's code pushed to GitHub

## Step 1: Deploy to Vercel

### 1.1 Connect Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 1.2 Deploy

1. Click "Deploy" with default settings
2. Wait for deployment to complete (usually 2-3 minutes)
3. Note your production URL: `https://your-app.vercel.app`

### 1.3 Custom Domain (Optional)

For a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## Step 2: Enable Farcaster Developer Mode

### 2.1 Access Developer Tools

1. Log into Farcaster (Warpcast or compatible client)
2. Go to Settings → Developer Tools
3. Toggle "Developer Mode" ON
4. Visit: https://farcaster.xyz/~/settings/developer-tools

### 2.2 Create Mini App Entry

1. In Developer Tools, click "Create Mini App"
2. Enter your production URL
3. The system will validate your domain

## Step 3: Generate Account Association

### 3.1 Create Signature

In Farcaster Developer Tools:

1. Navigate to "Mini Apps" section
2. Click "Generate Account Association"
3. Sign the message with your Farcaster wallet
4. Copy the generated JSON (header, payload, signature)

### 3.2 Update Manifest

Edit `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9...",
    "payload": "eyJkb21haW4iOiJ5b3VyLWRvbWFpbi5jb20ifQ==",
    "signature": "AbCdEf123..."
  },
  "miniapp": {
    "version": "1",
    "name": "FlowPepe",
    "iconUrl": "https://your-domain.vercel.app/pepe.gif",
    "homeUrl": "https://your-domain.vercel.app",
    "splashImageUrl": "https://your-domain.vercel.app/logo.png",
    "splashBackgroundColor": "#ded895",
    "description": "Help Pepe navigate through red candlestick obstacles!",
    "categories": ["games", "casual"],
    "tags": ["game", "flappy-bird", "pepe", "flow", "crypto"]
  }
}
```

## Step 4: Update Meta Tags

Edit `pages/_document.tsx` to replace all `https://your-domain.com` with your actual production URL:

```typescript
const miniappEmbed = {
  version: "1",
  imageUrl: "https://your-domain.vercel.app/logo.png",
  button: {
    title: "Play FlowPepe",
    action: {
      type: "launch_frame",
      name: "FlowPepe",
      url: "https://your-domain.vercel.app",
      splashImageUrl: "https://your-domain.vercel.app/logo.png",
      splashBackgroundColor: "#ded895",
    },
  },
};
```

Update all meta tag `content` attributes with your production URLs.

## Step 5: Redeploy

### 5.1 Commit Changes

```bash
git add .
git commit -m "Update manifest and meta tags for production"
git push
```

### 5.2 Automatic Deployment

Vercel will automatically deploy your changes. Monitor at:
- https://vercel.com/your-project

### 5.3 Verify Manifest

After deployment, check that your manifest is accessible:
```
https://your-domain.vercel.app/.well-known/farcaster.json
```

Should return your JSON with no errors.

## Step 6: Test Your Mini App

### 6.1 Preview in Developer Tools

1. Return to Farcaster Developer Tools
2. Find your Mini App in the list
3. Click "Preview"
4. Test all functionality:
   - App loads correctly
   - No infinite loading screen
   - User authentication works
   - Game plays smoothly
   - Scores save properly

### 6.2 Test in Farcaster Client

1. Open Warpcast or compatible client
2. Navigate to Mini Apps directory
3. Search for "FlowPepe"
4. Launch and play

### 6.3 Debug Issues

If the app doesn't load:
- Check browser console for errors
- Verify `sdk.actions.ready()` is called
- Ensure all URLs in manifest are correct
- Check that manifest is publicly accessible

## Step 7: Publish and Share

### 7.1 Automatic Discovery

Once your manifest is live and valid:
- Your Mini App appears in Farcaster's app directory
- Users can discover it organically
- No additional submission required

### 7.2 Promote Your App

Share on Farcaster:
```
Just launched FlowPepe! 🐸

Help Pepe navigate through red candlestick obstacles
in this addictive Flappy Bird-style game on Flow!

Play now: https://your-domain.vercel.app
```

Create a cast with:
- Screenshot or GIF of gameplay
- Link to your app
- Relevant hashtags: #FarcasterMiniApps #FlowPepe #Gaming

### 7.3 Gather Feedback

Monitor:
- User comments and casts
- Analytics in Developer Tools
- Error reports in Vercel logs

## Optional Enhancements

### Add Analytics

Integrate Vercel Analytics:
```bash
npm install @vercel/analytics
```

In `pages/_app.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <FarcasterProvider>
        <Component {...pageProps} />
      </FarcasterProvider>
      <Analytics />
    </>
  );
}
```

### Enable Speed Insights

```bash
npm install @vercel/speed-insights
```

### Custom Splash Screen

Update your app's splash screen:
1. Create high-quality 1200x800px image
2. Upload to `public/splash.png`
3. Update manifest `splashImageUrl`

### Error Monitoring

Add Sentry or similar:
```bash
npm install @sentry/nextjs
```

## Troubleshooting

### Manifest Not Found

Error: 404 on `/.well-known/farcaster.json`

**Solution**:
- Ensure file is in `public/.well-known/` directory
- Redeploy to Vercel
- Check file permissions

### Invalid Account Association

Error: Signature verification failed

**Solution**:
- Regenerate signature in Developer Tools
- Use the exact domain (with or without www)
- Ensure no trailing slashes in domain

### Infinite Loading Screen

App shows loading indefinitely

**Solution**:
- Check that `sdk.actions.ready()` is called in `FarcasterProvider.tsx`
- Verify SDK loaded: check browser console
- Test outside Farcaster client first

### CORS Errors

Error: CORS policy blocking requests

**Solution**:
- Verify `next.config.js` headers are correct
- Clear browser cache
- Check Vercel deployment logs

### Images Not Loading

Broken image icons in app

**Solution**:
- Use absolute URLs: `https://your-domain.com/image.png`
- Not relative URLs: `/image.png`
- Verify images exist in `public/` directory
- Check image file names match exactly

## Production Checklist

Before going live, verify:

- [ ] Deployed to production URL
- [ ] Manifest file accessible at `/.well-known/farcaster.json`
- [ ] All URLs updated from `your-domain.com` to actual domain
- [ ] Account association generated and added
- [ ] Meta tags updated with production URLs
- [ ] Tested in Farcaster client
- [ ] No console errors
- [ ] Game plays smoothly
- [ ] Scores save correctly
- [ ] Flow wallet connects properly
- [ ] Mobile responsive
- [ ] Audio works (with mute option)
- [ ] Share cast prepared

## Support

Need help?

- **Farcaster Docs**: https://miniapps.farcaster.xyz/docs
- **Flow Docs**: https://docs.flow.com
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: [Your repo issues page]

## Next Steps

After successful deployment:

1. **Monitor Usage**: Check analytics in Developer Tools
2. **Gather Feedback**: Listen to user comments
3. **Iterate**: Add features based on user requests
4. **Scale**: Consider backend for global leaderboards
5. **Monetize**: Explore NFT drops, tokens, or premium features

Congratulations! Your FlowPepe Farcaster Mini App is now live! 🎉🐸
