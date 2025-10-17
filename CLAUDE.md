# FlowPepe - Project Documentation

## Project Overview

FlowPepe is a **Flappy Bird-style arcade game** where players control Pepe the Frog, navigating through red candlestick obstacles. The game is designed as a **Telegram Mini App** with **Flow blockchain integration** for wallet connectivity and **Supabase** for persistent score tracking. The difficulty progressively increases as players advance, making the game more challenging over time.

### Game Concept
- **Player Character**: Pepe the Frog (animated GIF)
- **Obstacles**: Red candlestick pipes (trading chart theme)
- **Objective**: Navigate through gaps between pipes without collision
- **Scoring**: Points awarded for each successful pipe passage
- **Difficulty**: Game speed increases every 5 successful pipe passages

---

## Tech Stack

### Frontend Framework
- **Next.js 12.3.2** - React framework with SSR capabilities
- **React 17.0.2** - UI library
- **TypeScript 4.7.2** - Type safety and better developer experience

### Styling & Animation
- **Tailwind CSS 3.1.2** - Utility-first CSS framework
- **Framer Motion 6.2.4** - Physics-based animations for smooth gameplay
- **Custom CSS** - Telegram theme variables and touch optimizations

### State Management
- **use-immer 0.8.1** - Immutable state updates with simpler syntax
- **React Context API** - Global game state management

### Integrations
- **@twa-dev/sdk 7.8.0** - Telegram Web App SDK
- **@onflow/fcl 1.11.0** - Flow Client Library for blockchain wallet connection
- **@supabase/supabase-js 2.45.3** - Database for score persistence

### Utilities
- **lodash 4.17.21** - Utility functions (random number generation, array operations)
- **uuid 9.0.0** - Unique identifier generation for game elements

---

## Architecture

### Application Structure

```
/pepethegame
├── pages/
│   ├── _app.tsx           # App wrapper with Telegram initialization
│   └── index.tsx          # Main game page with GameProvider
├── components/
│   ├── Game.tsx           # Main game orchestrator
│   ├── FlappyBird.tsx     # Player character (Pepe)
│   ├── Pipes.tsx          # Obstacle system
│   ├── Background.tsx     # Visual background
│   ├── Footer.tsx         # Score display and controls
│   ├── TelegramProvider.tsx   # Telegram context provider
│   └── FlowWalletConnect.tsx  # Flow wallet integration
├── hooks/
│   ├── useGame.tsx        # Core game logic and state
│   ├── useScores.tsx      # Supabase score management
│   ├── useInterval.tsx    # Interval management for game loop
│   ├── useWindowSize.tsx  # Responsive window dimensions
│   ├── useElementSize.tsx # DOM element size tracking
│   └── [other utility hooks]
├── utils/
│   ├── telegram.ts        # Telegram Web App utilities
│   └── supabaseClient.js  # Supabase client configuration
├── public/
│   ├── pepe.gif          # Player character sprite
│   ├── pipe.png          # Candlestick obstacle image
│   ├── bg.png            # Background image
│   └── jeet.m4a          # Background music
└── flow.config.js        # Flow blockchain configuration
```

---

## Game Mechanics

### Core Game Loop

The game operates on two primary intervals:

1. **Bird Fall Interval** (100ms) - `fall()` function
   - Moves bird downward by 15px
   - Checks for collisions after each fall

2. **Pipe Movement Interval** (75ms initially) - `movePipes()` function
   - Moves all pipes leftward by distance amount
   - Recycles pipes that exit the screen
   - Increases difficulty progressively

### Physics System

#### Bird Mechanics
- **Size**: 92px × 64px
- **Starting Position**: Centered in game window
- **Fall Distance**: 15px per interval (100ms)
- **Fly Distance**: 75px upward on tap/click
- **Gravity**: Continuous downward movement when game is active
- **Control**: Single tap/click makes bird fly upward

#### Pipe Mechanics
- **Width**: Window width / 4 (4 pipes in rotation)
- **Height**: 1/3 of window height (base)
- **Extension**: Randomized up to 50% additional height
- **Gap**: Fixed distance between top and bottom pipes
- **Speed**: Starts at 10px per move, multiplies by 1.1 every 5 points
- **Tolerance**: 35px collision buffer for gameplay balance

### Difficulty Progression

The game implements **dynamic difficulty scaling**:

```typescript
// Speed multiplier system (hooks/useGame.tsx:173-178)
if (score % 5 === 0) {
  pipe.distance *= 1.1; // 10% speed increase
}
```

**Difficulty Curve**:
- Score 0-4: Base speed (10px/move)
- Score 5-9: 11px/move (+10%)
- Score 10-14: 12.1px/move (+21%)
- Score 15-19: 13.3px/move (+33%)
- Continues exponentially...

### Collision Detection (hooks/useGame.tsx:296-334)

The game checks two collision types:

1. **Ground Collision**
   ```typescript
   birdBottom >= windowHeight + tolerance
   ```

2. **Pipe Collision**
   - Horizontal check: Bird overlaps with pipe X position
   - Vertical check: Bird touches top or bottom pipe
   - Tolerance buffer: 35px on all sides for forgiving gameplay

---

## Components Breakdown

### Game.tsx (Main Orchestrator)
**Location**: `components/Game.tsx`

**Responsibilities**:
- Game state management (intro, playing, game over screens)
- Audio management (background music with mute toggle)
- Telegram user identification
- Flow wallet address tracking
- Score persistence integration
- Screen state transitions

**Key Features**:
- **Intro Screen**: Displays title, wallet connect, scores
- **Game Over Screen**: "You Jeeted Too Soon!" message with restart
- **Audio Loop**: Plays `jeet.m4a` during gameplay
- **Responsive Design**: Adapts to Telegram viewport

**User Flow**:
1. User sees intro → connects wallet (optional) → clicks START
2. Game begins → user taps to keep Pepe flying
3. Collision → game over screen → Try Again button

### FlappyBird.tsx (Player Character)
**Location**: `components/FlappyBird.tsx`

**Visual**:
- Renders `pepe.gif` flipped horizontally
- Pulsing animation when game not started
- Rotation animation on game over (0° to 540°)

**Animation**:
- Uses Framer Motion for smooth position updates
- 250ms transition duration for fluid movement
- Position updates from `useGame` hook state

### Pipes.tsx (Obstacles)
**Location**: `components/Pipes.tsx`

**Rendering**:
- Displays 4 pipe pairs simultaneously
- Each pair consists of top (rotated 180°) and bottom pipe
- Uses `pipe.png` image (candlestick graphic)

**Behavior**:
- Moves from right to left across screen
- Recycles off-screen pipes to right side
- Generates random heights on recycle
- Triggers score increment when recycled

### Footer.tsx (Score Display)
**Location**: `components/Footer.tsx`

**Displays**:
- **Best**: Highest click count in current session
- **Points**: Current click count
- **Speed**: Current pipe movement speed (distance/10)
- **Mute Toggle**: Sound on/off control

**Styling**:
- Green ground-like design
- Striped pattern animation
- Retro gaming aesthetic

### Background.tsx
**Location**: `components/Background.tsx`

Simple component rendering `bg.png` as full-screen background with rounded corners.

### TelegramProvider.tsx
**Location**: `components/TelegramProvider.tsx`

**Purpose**: Provides Telegram Web App context to entire application

**Features**:
- Accesses `window.Telegram.WebApp` object
- Makes Telegram user data available app-wide
- Enables Telegram-specific features (expand, theme, etc.)

### FlowWalletConnect.tsx
**Location**: `components/FlowWalletConnect.tsx`

**Purpose**: Flow blockchain wallet connection UI

**Features**:
- Connect/disconnect wallet functionality
- Displays truncated wallet address when connected
- Uses FCL (Flow Client Library) for authentication
- Updates parent component with wallet address changes

---

## Hooks Deep Dive

### useGame.tsx (Core Game Logic)
**Location**: `hooks/useGame.tsx` (384 lines)

This is the **heart of the game engine**. It manages:

#### State Structure
```typescript
{
  bird: { position, size, animate, isFlying, fall, fly },
  pipes: [{ top: {...}, bottom: {...} }, ...],
  pipe: { width, height, extension, tolerance, distance, delay },
  rounds: [{ score, datetime, key }, ...],
  isStarted: boolean,
  isReady: boolean,
  isGameOver: boolean,
  window: { width, height },
  multiplier: { distance, step },
  clickCount: number,
  bestClickCount: number
}
```

#### Key Functions

**startGame(window)** - `useGame.tsx:159`
- Initializes game with window dimensions
- Centers bird
- Creates initial pipe layout

**handleWindowClick()** - `useGame.tsx:245`
- Starts game on first click
- Makes bird fly on subsequent clicks
- Increments click counter

**fly(draft)** - `useGame.tsx:336`
- Moves bird upward by 75px
- Checks for collisions

**fall()** - `useGame.tsx:342`
- Moves bird downward by 15px
- Called every 100ms during gameplay
- Checks for collisions

**movePipes()** - `useGame.tsx:221`
- Moves all pipes leftward
- Recycles off-screen pipes
- Increments score
- Multiplies speed every 5 points

**checkImpact(draft)** - `useGame.tsx:296`
- Detects ground and pipe collisions
- Ends game on collision
- Updates best score if current exceeds it

**resetGame()** - `useGame.tsx:266`
- Clears game state
- Repositions bird and pipes
- Hides game over screen

### useScores.tsx (Score Persistence)
**Location**: `hooks/useScores.tsx`

**Purpose**: Manages score data in Supabase database

#### Database Tables
1. **user_scores**: Aggregate user statistics
   - `user_id` (Telegram ID)
   - `wallet_address` (Flow wallet)
   - `total_score` (cumulative)
   - `top_score` (personal best)
   - `last_played` (timestamp)

2. **individual_scores**: Individual game sessions
   - `user_id`
   - `score`
   - `created_at`

#### Functions

**fetchScores()** - `useScores.tsx:15`
- Retrieves user's total and top scores
- Initializes new user if not exists

**saveScore(score)** - `useScores.tsx:40`
- Saves individual game score
- Updates total and top scores
- Updates wallet address if connected

### useInterval.tsx
Custom hook for managing `setInterval` in React with proper cleanup.

### useWindowSize.tsx
Tracks browser window dimensions for responsive gameplay.

### useElementSize.tsx
Uses ResizeObserver to track DOM element dimensions.

---

## Integrations

### Telegram Mini App Integration

**SDK**: `@twa-dev/sdk`

**Initialization** (`pages/_app.tsx:11-21`):
```typescript
const WebApp = (await import("@twa-dev/sdk")).default;
WebApp.ready();
WebApp.onEvent("viewportChanged", handleViewportChange);
```

**Features Used**:
- `WebApp.ready()`: Signals app is ready
- `WebApp.expand()`: Expands to full screen
- `initDataUnsafe.user.id`: User identification
- Viewport event listeners

**User Identification** (`components/Game.tsx:16`):
```typescript
const telegramUserId = webApp?.initDataUnsafe?.user?.id || "anonymous";
```

### Flow Blockchain Integration

**Library**: `@onflow/fcl`

**Configuration** (`flow.config.js`):
```javascript
{
  "app.detail.title": "FlowPepe",
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "flow.network": "mainnet",
  "walletconnect.projectId": "4dfbe201a5e404899a7e307f639c902f"
}
```

**Wallet Functions** (`components/FlowWalletConnect.tsx`):
- `fcl.authenticate()`: Connect wallet
- `fcl.unauthenticate()`: Disconnect wallet
- `fcl.currentUser.subscribe()`: Monitor auth state

**Current Usage**:
- Wallet address stored with user scores
- Ready for future tokenization/NFT features
- No smart contract interactions yet

### Supabase Integration

**Client Setup** (`utils/supabaseClient.js`):
```javascript
createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Operations**:
- Fetching user scores on load
- Saving scores after each game
- Updating aggregate statistics
- Wallet address persistence

---

## Game Flow

### 1. Application Load
```
User opens Telegram Mini App
↓
_app.tsx initializes Telegram SDK
↓
flow.config.js loads Flow configuration
↓
index.tsx renders with GameProvider
↓
Intro screen displays
```

### 2. Game Start Sequence
```
User clicks START button
↓
handleStartClick() called
↓
showIntro = false
↓
handleWindowClick() triggered
↓
isStarted = true, round created
↓
Bird and pipes rendered
↓
Fall and movement intervals begin
```

### 3. Gameplay Loop
```
Every 100ms: fall() → bird drops 15px → checkImpact()
Every 75ms: movePipes() → pipes move left → check if recycled
On Click: fly() → bird rises 75px → checkImpact()
On Score: every 5 points → speed multiplies by 1.1
```

### 4. Game Over Sequence
```
Collision detected
↓
isGameOver = true, isStarted = false
↓
Bird rotation animation (540°)
↓
Game over screen displays
↓
saveScore() called (Supabase)
↓
bestClickCount updated if exceeded
↓
User clicks "Try Again" → resetGame()
```

### 5. Score Persistence
```
Game over triggered
↓
saveScore(clickCount) called
↓
Insert into individual_scores table
↓
Update user_scores table (total, top)
↓
UI reflects new scores on restart
```

---

## Styling & Theming

### Color Palette
- **Background**: `#ded895` (cream/beige - retro game aesthetic)
- **Border**: `#e5e7eb` (zinc-200)
- **Ground**: Green with striped pattern
- **Text**: Green-900 for retro feel
- **Buttons**: Green, Red, Blue variants

### Typography
- **Game UI**: "Press Start 2P" (pixel-style retro font)
- **Scores**: Monospace font
- **Loaded via Google Fonts** in `index.tsx:20-23`

### Responsive Design
- Max width: 480px (mobile-optimized)
- Max height: 800px
- Border: 8px solid border for game feel
- Rounded corners: Polished appearance

### Touch Optimizations (`styles/globals.css`)
```css
-webkit-tap-highlight-color: transparent;
-webkit-user-select: none;
user-select: none;
```
Prevents text selection and tap highlights for smooth mobile gameplay.

### Telegram Theme Variables
```css
--tg-theme-bg-color
--tg-theme-text-color
--tg-theme-button-color
```
Adapts to user's Telegram theme settings.

---

## Assets

### Images
- **pepe.gif**: Animated Pepe character (player sprite)
- **pipe.png**: Red candlestick obstacle
- **bg.png**: Background image (trading/chart theme)
- **bg1.png, bg2.png, bg3.png**: Alternative backgrounds (unused)
- **pipe2.png**: Alternative pipe design (unused)
- **logo.png**: App logo
- **bird.png, bird-up.svg, bird-down.svg**: Alternative bird sprites (unused)

### Audio
- **jeet.m4a**: Background music loop
- Crypto slang "jeet" (weak hands selling) ties to trading theme

### Icons
- **favicon.ico**: Browser tab icon

---

## Key Features

### 1. Progressive Difficulty
- Speed increases 10% every 5 successful pipes
- Creates exponential difficulty curve
- Keeps experienced players engaged

### 2. Score Tracking
- **Click Count**: Number of taps in current game
- **Best**: Highest score in current session
- **Total Score**: Cumulative across all games (Supabase)
- **Top Score**: Personal best (Supabase)

### 3. User Identification
- Primary: Telegram user ID (always available)
- Secondary: Flow wallet address (optional)
- Anonymous fallback if neither available

### 4. Audio System
- Background music loops during gameplay
- Mute toggle persists during session
- Auto-pauses when game not active

### 5. Responsive Game Window
- Adapts to device viewport
- Maintains aspect ratio
- Telegram viewport integration

### 6. Smooth Animations
- Framer Motion for physics-based movement
- Linear easing for consistent speed
- 250ms transitions for fluidity

### 7. Collision Tolerance
- 35px buffer on all sides
- Makes gameplay more forgiving
- Balances challenge with playability

---

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Development Notes

### State Management Pattern
The project uses **Immer** for immutable state updates, which simplifies complex nested state modifications:

```typescript
setState((draft) => {
  draft.bird.position.y -= 75; // Direct mutation in draft
  checkImpact(draft);
  return draft;
});
```

### Animation Strategy
- **Framer Motion** handles all visual animations
- **useInterval** manages game loop timing
- **Linear easing** ensures consistent physics
- **No requestAnimationFrame** - interval-based for simplicity

### Component Communication
- **Context API** (GameProvider) for global game state
- **Props** for parent-child communication
- **Callback functions** for state updates (e.g., `onAddressChange`)

### Performance Considerations
- **Image optimization disabled** (`next.config.js:4`) for Telegram compatibility
- **Trailing slashes** enabled for consistent routing
- **Webpack fallbacks** for client-side only libraries

### Mobile-First Design
- Touch events optimized (no text selection, tap highlights)
- Responsive sizing with max-width constraints
- Telegram viewport expansion for full-screen feel

### Crypto/Trading Theme
- **Red candlesticks**: Trading chart reference
- **"Jeet"**: Crypto slang for panic selling
- **Flow blockchain**: Crypto wallet integration
- **Score accumulation**: Mirrors token accumulation

---

## Game Balance

### Current Settings (hooks/useGame.tsx:8-73)

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Bird Width | 92px | Collision hitbox |
| Bird Height | 64px | Collision hitbox |
| Fall Distance | 15px | Gravity strength |
| Fall Delay | 100ms | Gravity frequency |
| Fly Distance | 75px | Jump strength |
| Pipe Width | 25% of window | Gap frequency |
| Pipe Base Height | 33% of window | Obstacle size |
| Pipe Extension | 0-50% extra | Randomness |
| Pipe Tolerance | 35px | Forgiveness |
| Pipe Delay | 75ms | Movement frequency |
| Initial Speed | 10px/move | Starting difficulty |
| Speed Multiplier | 1.1 (10%) | Difficulty scaling |
| Multiplier Step | Every 5 points | Scaling frequency |

### Difficulty Tuning
To adjust game difficulty, modify:
- `bird.fall.distance`: Higher = harder (faster falling)
- `bird.fly.distance`: Higher = easier (bigger jumps)
- `pipe.tolerance`: Higher = easier (more forgiving)
- `pipe.distance`: Higher = harder (faster obstacles)
- `multiplier.distance`: Higher = steeper difficulty curve

---

## Future Enhancement Ideas

Based on codebase structure, potential features:

1. **NFT Integration**: Mint high scores as Flow NFTs
2. **Leaderboards**: Global ranking system via Supabase
3. **Power-ups**: Temporary abilities (slow-mo, shield, etc.)
4. **Skins**: Alternative Pepe sprites, pipe designs
5. **Achievements**: Milestone rewards
6. **Daily Challenges**: Specific score targets
7. **Multiplayer**: Real-time competitive mode
8. **Token Rewards**: Flow token prizes for high scores
9. **Sound Effects**: Collision, scoring, flying sounds
10. **Difficulty Modes**: Easy/Normal/Hard presets

---

## Deployment

### Vercel Deployment
The project is optimized for Vercel:
- Next.js native support
- Environment variables in dashboard
- Automatic builds on git push
- Edge network distribution

### Static Export
Can generate static export:
```bash
npm run build
npm run export
```

### Telegram Bot Setup
1. Create bot with BotFather
2. Set Mini App URL to deployment URL
3. Configure bot commands and description
4. Add bot to Telegram menu

---

## Project Commands

```bash
npm run dev    # Start development server (localhost:3000)
npm run build  # Create production build
npm run start  # Start production server
npm run export # Generate static export
```

---

## Code Quality Observations

### Strengths
✅ TypeScript for type safety
✅ Modular component structure
✅ Custom hooks for reusable logic
✅ Immutable state with Immer
✅ Proper cleanup in effects
✅ Responsive design patterns
✅ Clear separation of concerns

### Areas for Improvement
⚠️ Some unused assets (pipe2.png, bg1-3.png, bird sprites)
⚠️ Error handling could be more robust
⚠️ No unit tests present
⚠️ Some magic numbers could be constants
⚠️ Footer.tsx mute icon SVG paths appear incorrect
⚠️ Could benefit from sound effect system (not just music)

---

## Summary

**FlowPepe** is a well-architected Flappy Bird clone with modern web technologies and blockchain integration. The game successfully combines:

- **Telegram Mini App** platform for distribution
- **Flow blockchain** for future tokenization
- **Supabase** for persistent data
- **Framer Motion** for smooth gameplay
- **Progressive difficulty** for replayability

The codebase is clean, modular, and ready for feature expansion. The crypto/trading theme (candlesticks, "jeet", Flow integration) creates a unique identity in the casual gaming space.

**Core Game Loop**: Simple tap-to-fly mechanics with increasing speed provide addictive, skill-based gameplay suitable for short mobile sessions.

**Technical Foundation**: Next.js + TypeScript + Tailwind provides modern, maintainable architecture ready for scaling.

**Integration Strategy**: Telegram for user acquisition, Flow for crypto features, Supabase for data - creates a complete Web3 gaming ecosystem.
