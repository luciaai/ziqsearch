# Voice Feature TODO

## Status
🔴 **DISABLED** - Voice feature is currently hidden from the UI until infrastructure is set up.

## Overview
The voice feature is fully implemented in the codebase but requires external infrastructure to function. The UI code is complete and ready to use once the backend services are configured.

## Required Infrastructure

### 1. Voice Backend Server
**Status:** ❌ Not Set Up

**What it does:**
- Creates ephemeral session tokens for xAI's Realtime Voice API
- Acts as a secure intermediary between the frontend and xAI's API

**Requirements:**
- Node.js backend server
- Endpoint: `POST /session`
- Should return:
  ```json
  {
    "client_secret": {
      "value": "ephemeral_token_here",
      "expires_at": 1234567890
    },
    "voice": "Ara",
    "instructions": "..."
  }
  ```

**Setup Steps:**
1. Create a backend server (Express.js recommended)
2. Implement `/session` endpoint that calls xAI API to create session tokens
3. Deploy the backend server
4. Set environment variable: `NEXT_PUBLIC_VOICE_BACKEND_URL=https://your-backend-url.com`

**Default URL:** `http://localhost:8000` (for local development)

---

### 2. Audio Worklet Processor
**Status:** ❌ Missing File

**What it does:**
- Processes microphone audio in real-time
- Converts audio to the correct format for xAI's API
- Calculates input volume for UI feedback

**Requirements:**
- File location: `/public/audio-capture-processor.js`
- Must be a Web Audio API AudioWorkletProcessor

**Implementation:**
The processor needs to:
- Accept audio chunks from the microphone
- Convert to PCM16 format at 48kHz sample rate
- Send chunks every 100ms
- Calculate RMS volume for visual feedback
- Handle mute state

**Reference:** See `hooks/use-voice-client.ts` lines 246-305 for how it's used

---

### 3. xAI Realtime API Access
**Status:** ❌ Requires Account/API Key

**What it does:**
- Provides real-time voice conversation capabilities
- Handles speech-to-text, AI responses, and text-to-speech

**Requirements:**
- xAI API account
- Access to Realtime API endpoint: `wss://api.x.ai/v1/realtime`
- API authentication (handled by backend server)

**Features Used:**
- Voice conversation with 5 voice options (Ara, Rex, Sal, Eve, Leo)
- Server-side voice activity detection (VAD)
- Integration with `web_search` and `x_search` tools
- Real-time audio streaming

---

## Implementation Checklist

- [ ] Set up voice backend server
  - [ ] Create Node.js/Express server
  - [ ] Implement `/session` endpoint
  - [ ] Configure xAI API credentials
  - [ ] Deploy backend server
  - [ ] Test session token generation

- [ ] Create audio worklet processor
  - [ ] Write `audio-capture-processor.js`
  - [ ] Test audio capture and processing
  - [ ] Verify volume calculation
  - [ ] Test mute functionality

- [ ] Configure environment variables
  - [ ] Add `NEXT_PUBLIC_VOICE_BACKEND_URL` to `.env.local`
  - [ ] Add to production environment variables

- [ ] Test voice feature
  - [ ] Test microphone access and permissions
  - [ ] Test voice conversation flow
  - [ ] Test all 5 voice options
  - [ ] Test web_search and x_search tool integration
  - [ ] Test mute/unmute functionality
  - [ ] Test conversation transcript display

- [ ] Re-enable in UI
  - [ ] Change `{false && user && (` to `{user && (` in `components/app-sidebar.tsx` (line 509)
  - [ ] Remove TODO comment
  - [ ] Test navigation to voice page

---

## Files Involved

### Frontend (Already Implemented ✅)
- `/app/voice/page.tsx` - Main voice UI
- `/app/voice/layout.tsx` - Voice page layout with sidebar
- `/hooks/use-voice-client.ts` - Voice client logic and WebSocket handling
- `/components/ui/orb.tsx` - Visual feedback orb
- `/components/ui/voice-button.tsx` - Voice control button
- `/components/ui/voice-picker.tsx` - Voice selection UI
- `/components/app-sidebar.tsx` - Sidebar navigation (line 507-529)

### Backend (Needs Implementation ❌)
- Voice backend server (separate repository/service)
- `/public/audio-capture-processor.js` (needs to be created)

### Configuration
- `.env.local` - Add `NEXT_PUBLIC_VOICE_BACKEND_URL`
- Production environment variables

---

## When Ready to Enable

1. Complete all items in the Implementation Checklist
2. Test thoroughly in development environment
3. Update `components/app-sidebar.tsx`:
   - Line 509: Change `{false && user && (` to `{user && (`
   - Remove lines 507-508 (TODO comments)
4. Deploy and test in production

---

## Additional Notes

- The voice feature uses the same branding as the rest of the app (Ziq Voice)
- Voice instructions reference "Scira" in the system prompt (line 459 of `use-voice-client.ts`) - this should be updated to "Ziq" when enabling
- The feature supports both mobile and desktop layouts
- Conversation transcripts are displayed in real-time
- Stats tracking includes latency, WPM for user and assistant, and tool latency

---

## Resources

- xAI Realtime API Documentation: (check xAI's official docs)
- Web Audio API AudioWorklet: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
- Current implementation: `/hooks/use-voice-client.ts`
