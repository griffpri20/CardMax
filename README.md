<<<<<<< HEAD
# CardMax

> Find the best credit card for every purchase — instantly.

CardMax uses your location to detect nearby merchants, infers the spend category, and ranks your cards by effective cents-per-dollar value using real earn rates and TPG CPP baselines.

---

## Features

- **Location-aware merchant detection** via Google Places API
- **Calculation engine** — `effectiveValue = earnRate × cppValue` for every card you own
- **8 cards pre-loaded** with accurate bonus categories and CPP values
- **Rotating category support** for Chase Freedom Flex & Discover it (sync quarterly)
- **Per-card CPP editor** — override TPG defaults with your own valuations
- **Manual category override** — pick any spend category without GPS
- **Chase / Amex Offers reminder** on the results screen
- **Fully offline** — no backend, all data stored locally via AsyncStorage

---

## Setup (Mac / iOS)

### Prerequisites

- **macOS** with Xcode installed (for iOS Simulator)
- **Node.js** ≥ 18 (`brew install node` or via nvm)
- **Expo CLI** — installed automatically via `npx`
- **Expo Go** app on your iPhone (optional, for physical device testing)

---

### 1. Install dependencies

```bash
cd CardMax
npm install
```

---

### 2. Add your Google Places API key

**Get an API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Places API** (the original one, not "Places API New")
4. Go to **Credentials → Create Credentials → API Key**
5. Restrict it to **iOS apps** with bundle ID `com.cardmax.app` (for production)

**Add to the project:**

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
GOOGLE_PLACES_API_KEY=AIzaSy...your_real_key_here
```

> **Note:** Without an API key, the app runs with mock merchant data so you can develop and test the full UI without a key.

---

### 3. Run on iOS Simulator

```bash
npx expo start
```

Then press **`i`** to open in the iOS Simulator (requires Xcode).

Or run directly:

```bash
npx expo start --ios
```

---

### 4. Test on a physical iPhone (Expo Go)

1. Install **Expo Go** from the App Store on your iPhone
2. Make sure your iPhone and Mac are on the **same Wi-Fi network**
3. Run `npx expo start`
4. Scan the QR code shown in the terminal with your iPhone camera

> Location permissions work on physical devices. The Simulator uses a simulated location (Apple HQ by default — you can change it in Simulator → Features → Location).

---

### 5. Test the calculation engine in isolation

```bash
# No special setup needed — just Node
node -e "
const { getBestCard } = require('./src/engine/getBestCard');
const { DEFAULT_OWNED_CARD_IDS } = require('./src/data/cards');
const result = getBestCard('dining', DEFAULT_OWNED_CARD_IDS);
result.forEach(r => console.log(r.card.name, r.effectiveValue.toFixed(2) + '¢/dollar'));
"
```

---

## Project Structure

```
CardMax/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout, navigation stack config
│   ├── index.tsx           # Location Screen (main screen)
│   ├── results.tsx         # Results Screen
│   └── settings.tsx        # Settings Screen
├── src/
│   ├── components/         # Shared UI components
│   │   ├── CardChip.tsx    # Mini card graphic
│   │   ├── CardRankRow.tsx # Ranked card list item
│   │   └── MerchantRow.tsx # Nearby merchant list item
│   ├── data/
│   │   ├── cards.ts        # All 8 card definitions (earn rates, CPP, colors)
│   │   └── categories.ts   # Category enum, icon/label maps, Places type map
│   ├── engine/
│   │   └── getBestCard.ts  # Pure calculation function + formatters
│   ├── hooks/
│   │   └── useSettings.ts  # AsyncStorage-backed user settings hook
│   ├── services/
│   │   └── places.ts       # Google Places Nearby Search API client
│   └── types/
│       └── index.ts        # TypeScript interfaces
├── app.config.ts           # Dynamic Expo config (reads .env)
├── babel.config.js         # NativeWind/Babel config
├── global.css              # Tailwind CSS v4 entry point
├── metro.config.js         # Metro + NativeWind config
├── .env                    # Local secrets (gitignored)
├── .env.example            # Template for .env
└── README.md
```

---

## Card Database

Located in `src/data/cards.ts`. Each card has:

| Field | Description |
|---|---|
| `id` | Unique slug |
| `name` | Display name |
| `issuer` | Chase, Amex, etc. |
| `color` / `accentColor` | Hex colors for card UI |
| `bonusCategories` | Array of `{ category, earnRate }` |
| `baseEarnRate` | Points/$ on everything else |
| `cppValue` | Cents per point (TPG baseline) |
| `rotatingCategory` | Nullable — updated via Settings sync |
| `network` | Visa / Mastercard / Amex / Discover |

**Current cards:** Chase Sapphire Reserve, Amex Gold, Amex Platinum, Chase Freedom Flex, Chase Freedom Unlimited, Capital One Venture X, Citi Double Cash, Discover it

---

## Calculation Engine

`src/engine/getBestCard.ts` — pure, no side effects:

```ts
getBestCard(
  merchantCategory: MerchantCategory,
  ownedCardIds: string[],
  cppOverrides: Record<string, number>,   // user's custom CPP values
  rotatingOverrides: Record<string, string | null>  // synced rotating categories
): CardRanking[]
```

**Formula:**
```
effectiveValue (¢/dollar) = earnRate × cppValue
```

Example — Amex Gold at a grocery store:
```
4 points/$ × 2.0¢/pt = 8.0¢/dollar
```

---

## Rotating Categories

Chase Freedom Flex and Discover it earn **5x/5%** on rotating quarterly categories.

- Tap **Settings → Sync Now** to auto-populate the current quarter's categories
- Or manually select the active category with the chip picker
- The app shows a **stale sync warning** if >30 days since last sync

---

## App Store Deployment

1. Create an [Expo Application Services (EAS)](https://expo.dev/eas) account
2. Replace `your-eas-project-id` in `app.config.ts` with your real project ID
3. Update `bundleIdentifier` in `app.config.ts` to your registered bundle ID
4. Build:
   ```bash
   npx eas build --platform ios
   ```
5. Submit:
   ```bash
   npx eas submit --platform ios
   ```

---

## Development Tips

- **Mock data:** App works without a Google Places API key — it returns 5 hardcoded merchants so you can test the full flow
- **Simulator location:** Set a custom location in Simulator → Features → Location → Custom Location
- **CPP values:** Defaults are TPG baselines as of early 2025. Users can override per-card in Settings
- **Stale check:** Settings shows a warning banner if rotating categories haven't been synced in >30 days

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54 / React Native |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind v4 + Tailwind CSS v4 |
| Storage | AsyncStorage |
| Location | expo-location |
| Config | expo-constants + dotenv |
| Build | EAS Build |
=======
# CardMax
>>>>>>> 2266be9d464de00a87484694b3685649f89bf5a8
