# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wheelbase-web** is a React web application for the Emergency Contact Response Page. When a Wheelbase user triggers an SOS alert, their emergency contacts receive an SMS with a link to this web page where they can:

- View the alert details and real-time location
- Acknowledge the alert (received, responding, on the way, arrived)
- Chat with the SOS user in real-time
- Send quick status updates

**URL Pattern:** `https://ridewheelbase.app/emergency/respond/{token}`

**Tech Stack:**
- Vite 5.x (build tool)
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Mapbox GL JS 3.x (maps)
- Supabase JS (API & realtime)

## Directory Structure

```
wheelbase-web/
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind theme (Wheelbase colors)
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variables template
├── CLAUDE.md               # This file
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Router configuration
    ├── index.css           # Global styles + Tailwind
    ├── vite-env.d.ts       # Type definitions
    ├── components/
    │   ├── AlertHeader.tsx         # Emergency alert header with status
    │   ├── LocationMap.tsx         # Mapbox map with user marker
    │   ├── AcknowledgmentButtons.tsx  # Response options
    │   ├── ChatWindow.tsx          # Chat message history
    │   ├── ChatInput.tsx           # Message input + quick replies
    │   ├── StatusUpdatePanel.tsx   # Quick status templates
    │   └── LoadingSpinner.tsx      # Loading indicator
    ├── pages/
    │   ├── EmergencyResponsePage.tsx  # Main page
    │   ├── TokenExpiredPage.tsx       # Expired/invalid token error
    │   └── NotFoundPage.tsx           # 404 page
    ├── services/
    │   ├── supabase.ts         # Supabase client
    │   ├── emergencyApi.ts     # API calls to emergency-acknowledgment Edge Function
    │   └── realtime.ts         # Supabase realtime subscriptions
    ├── hooks/
    │   ├── useEmergencyAlert.ts  # Main state management hook
    │   └── useChat.ts            # Chat message handling
    ├── types/
    │   └── emergency.ts         # TypeScript interfaces
    └── utils/
        └── formatters.ts        # Date/time formatting utilities
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://hvwpdiyrqonuaomwkuxk.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>
VITE_MAPBOX_TOKEN=<your_mapbox_token>
```

**Note:** These are public/client-side keys. Sensitive operations are handled by the `emergency-acknowledgment` Edge Function which uses the service role key.

## API Integration

This app integrates with the `emergency-acknowledgment` Edge Function located at:
`/wheelbase-supabase/supabase/functions/emergency-acknowledgment/index.ts`

### Actions

| Action | Description |
|--------|-------------|
| `get_alert_info` | Fetch alert details, chat history, status templates |
| `acknowledge` | Record acknowledgment (received, responding, on_the_way, arrived, cannot_help) |
| `send_message` | Send a chat message to the SOS user |
| `status_update` | Send a quick status using predefined templates |

### Request Format

```typescript
POST /functions/v1/emergency-acknowledgment
Content-Type: application/json

{
  "action": "get_alert_info",
  "token": "abc123..."
}
```

### Response Format

```typescript
{
  "success": true,
  "data": { ... }
}

// or on error:
{
  "success": false,
  "error": { "message": "..." }
}
```

## Real-time Features

The app uses Supabase Realtime for:

1. **Location Updates:** Subscribe to `sos_alerts` table updates for the current alert
2. **Chat Messages:** Subscribe to `emergency_chat_messages` table inserts
3. **Alert Status:** Subscribe to alert status changes (active → resolved)

See `src/services/realtime.ts` for implementation.

## Styling

The app uses Wheelbase's design system colors defined in `tailwind.config.js`:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Yellow | `#FFD535` | Buttons, accents, highlights |
| Primary Background | `#1E2329` | Page background |
| Secondary Background | `#2A2F36` | Cards, sections |
| Card Background | `#363C44` | Elevated elements |
| Success | `#10B981` | Positive states |
| Error | `#EF4444` | Errors, active emergencies |
| Warning | `#F59E0B` | Warnings |

## Testing

### Manual Testing with Real Tokens

1. Trigger an SOS in the Flutter app
2. Check database for the response token:
   ```sql
   SELECT token FROM emergency_response_tokens WHERE sos_alert_id = 'xxx';
   ```
3. Visit `http://localhost:5173/emergency/respond/{token}`

### Test Scenarios

- [ ] Valid token shows alert details and map
- [ ] Expired token shows appropriate error
- [ ] Invalid token shows error
- [ ] Acknowledgment buttons update status
- [ ] Chat messages appear in real-time
- [ ] Location updates on map in real-time
- [ ] Resolved alert shows disabled state
- [ ] Responsive design works on mobile
- [ ] "Navigate" button opens maps app

## Related Files

- **Edge Function:** `/wheelbase-supabase/supabase/functions/emergency-acknowledgment/`
- **Flutter Emergency Chat:** `/wheelbase-app/wheelbase_app/lib/features/emergency/presentation/pages/emergency_chat_page.dart`
- **Database Tables:**
  - `sos_alerts` - Main alert records
  - `emergency_contacts` - User's emergency contacts
  - `emergency_response_tokens` - Secure tokens for web access
  - `emergency_acknowledgments` - Contact acknowledgments
  - `emergency_chat_messages` - Chat messages
  - `emergency_status_templates` - Quick reply templates

## Deployment

This project is designed to be deployed to a static hosting service (Vercel, Netlify, etc.) and served from `ridewheelbase.app/emergency/respond/*`.

```bash
# Build production bundle
npm run build

# Output in ./dist folder
```
