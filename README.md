# Wheelbase Emergency Response Web App

React web application for the Emergency Contact Response Page. When a Wheelbase user triggers an SOS alert, their emergency contacts receive an SMS with a link to this web page.

**Production URL:** https://ridewheelbase.app/emergency/respond/{token}

## Features

- View emergency alert details and real-time location
- Acknowledge the alert (received, responding, on the way, arrived)
- Chat with the SOS user in real-time
- Send quick status updates
- Navigate to user's location

## Tech Stack

- **Framework:** React 18 + TypeScript 5
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Maps:** Mapbox GL JS 3
- **Backend:** Supabase (Edge Functions, Realtime)

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AlertHeader.tsx         # Emergency alert header
│   ├── LocationMap.tsx         # Mapbox map with user marker
│   ├── AcknowledgmentButtons.tsx  # Response options
│   ├── ChatWindow.tsx          # Chat message history
│   └── StatusUpdatePanel.tsx   # Quick status templates
├── pages/               # Route pages
│   ├── EmergencyResponsePage.tsx  # Main page
│   ├── TokenExpiredPage.tsx       # Expired token error
│   └── NotFoundPage.tsx           # 404 page
├── services/            # API and realtime
│   ├── supabase.ts         # Supabase client
│   ├── emergencyApi.ts     # API calls
│   └── realtime.ts         # Realtime subscriptions
├── hooks/               # Custom React hooks
│   ├── useEmergencyAlert.ts  # Main state management
│   └── useChat.ts            # Chat handling
└── types/               # TypeScript interfaces
    └── emergency.ts
```

## Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://hvwpdiyrqonuaomwkuxk.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_MAPBOX_TOKEN=<mapbox_token>
```

## Real-time Features

- **Location Updates:** Live position tracking on map
- **Chat Messages:** Real-time messaging with SOS user
- **Alert Status:** Status changes (active → resolved)

## Deployment

Deployed to Vercel. Build output is in `./dist`.

```bash
vercel --prod
```

## Related Projects

- [wheelbase-app](../wheelbase-app) - Flutter mobile app (SOS triggers)
- [wheelbase-supabase](../wheelbase-supabase) - Emergency Edge Functions
