# Future Feature Ideas

---

## Features Requiring API Keys (Currently Disabled)

### Overview
The following features are built into the codebase but require external API keys to function. They are currently hidden from the UI until the necessary API keys are configured.

### Stock & Currency Search
**Status:** 🔴 **DISABLED** (Hidden from UI)

**Required API Key:**
- `VALYU_API_KEY` - Get from [valyu.ai](https://valyu.ai)

**Features:**
- Stock price charts and historical data
- Company financial statistics (P/E ratios, market cap, etc.)
- SEC filings (10-K, 10-Q, 8-K)
- Balance sheets, income statements, cash flow
- Earnings data and insider transactions
- Currency conversion (forex data)
- Market movers (gainers, losers, most active)

**Tools Affected:**
- `stockChartTool` (`lib/tools/stock-chart.ts`)
- `currencyConverterTool` (`lib/tools/currency-converter.ts`)

**To Enable:**
1. Sign up at [valyu.ai](https://valyu.ai)
2. Get API key
3. Add to `.env`: `VALYU_API_KEY=your_key_here`
4. Update `lib/utils.ts` line 82: change `show: false` to `show: true`
5. Restart dev server

---

### Weather Search
**Status:** ⚠️ **BUILT-IN** (May not work without API key)

**Required API Key:**
- `OPENWEATHER_API_KEY` - Get from [openweathermap.org](https://openweathermap.org/api)

**Features:**
- Current weather conditions
- 5-day weather forecast
- Air quality index
- Location-based weather

**Tools Affected:**
- `weatherTool` (`lib/tools/weather.ts`)

**To Enable:**
1. Sign up at OpenWeather
2. Get free API key
3. Add to `.env`: `OPENWEATHER_API_KEY=your_key_here`
4. Restart dev server

---

### Movie & TV Search
**Status:** ⚠️ **BUILT-IN** (May not work without API key)

**Required API Key:**
- `TMDB_API_KEY` - Get from [themoviedb.org](https://www.themoviedb.org/settings/api)

**Features:**
- Search movies and TV shows
- Get trending movies/TV
- Movie/show details, cast, crew
- Ratings and reviews

**Tools Affected:**
- `movieTvSearchTool` (`lib/tools/movie-tv-search.ts`)
- `trendingMoviesTool` (`lib/tools/trending-movies.ts`)
- `trendingTvTool` (`lib/tools/trending-tv.ts`)

**To Enable:**
1. Sign up at TMDB
2. Get free API key
3. Add to `.env`: `TMDB_API_KEY=your_key_here`
4. Restart dev server

---

### Flight Tracking
**Status:** ⚠️ **BUILT-IN** (May not work without API keys)

**Required API Keys:**
- `AMADEUS_API_KEY` - Get from [developers.amadeus.com](https://developers.amadeus.com)
- `AMADEUS_API_SECRET`

**Features:**
- Real-time flight tracking
- Flight status and delays
- Airline and route information

**Tools Affected:**
- `flightTrackerTool` (`lib/tools/flight-tracker.ts`)

**To Enable:**
1. Sign up at Amadeus for Developers
2. Get API key and secret
3. Add to `.env`:
   ```
   AMADEUS_API_KEY=your_key_here
   AMADEUS_API_SECRET=your_secret_here
   ```
4. Restart dev server

---

### Google Maps Integration
**Status:** ⚠️ **BUILT-IN** (May not work without API key)

**Required API Key:**
- `GOOGLE_MAPS_API_KEY` - Get from [Google Cloud Console](https://console.cloud.google.com)

**Features:**
- Place search and geocoding
- Nearby places search
- Place details (reviews, ratings, hours)
- Address lookup

**Tools Affected:**
- `findPlaceOnMapTool` (`lib/tools/map-tools.ts`)
- `nearbyPlacesSearchTool` (`lib/tools/map-tools.ts`)

**To Enable:**
1. Create Google Cloud project
2. Enable Maps JavaScript API and Places API
3. Get API key
4. Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key_here`
5. Restart dev server

---

### Code Interpreter (Python Execution)
**Status:** ⚠️ **BUILT-IN** (May not work without API key)

**Required API Key:**
- `DAYTONA_API_KEY` - Get from [daytona.io](https://daytona.io)

**Features:**
- Execute Python code in sandbox
- Data analysis and visualization
- File processing

**Tools Affected:**
- `codeInterpreterTool` (`lib/tools/code-interpreter.ts`)
- Used in Extreme search mode

**To Enable:**
1. Sign up at Daytona
2. Get API key
3. Add to `.env`: `DAYTONA_API_KEY=your_key_here`
4. Restart dev server

---

---

### Reddit Search
**Status:** 🔴 **DISABLED** (Hidden from UI)

**Required API Key:**
- `PARALLEL_API_KEY` - Get from [Parallel](https://www.parallel.so/)

**Features:**
- Search Reddit posts and comments
- Filter by subreddit, time range
- Multiple query support (1-5 queries)
- Display post metadata (subreddit, score, date)
- Direct links to Reddit posts

**Tools Affected:**
- `redditSearchTool` (`lib/tools/reddit-search.ts`)

**To Enable:**
1. Sign up at [Parallel](https://www.parallel.so/)
2. Get API key
3. Add to `.env`: `PARALLEL_API_KEY=your_key_here`
4. Update `lib/utils.ts` line 128: change `show: false` to `show: true`
5. Restart dev server

---

### Summary

**Currently Disabled (Hidden from UI):**
- ❌ **Memory Search** (requires `SUPERMEMORY_API_KEY`) - **DISABLED 2026-03-22**
- ❌ **Connectors** (Google Drive/Notion/OneDrive) (requires `SUPERMEMORY_API_KEY`) - **DISABLED 2026-03-22**
- ❌ **GitHub OAuth Login** (requires `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`) - **DISABLED 2026-03-22**
- ❌ **Twitter/X OAuth Login** (requires `TWITTER_CLIENT_ID` + `TWITTER_CLIENT_SECRET`) - **DISABLED 2026-03-22**

**Built-in but Will Not Work (Missing API Keys):**
- ⚠️ **Gemini AI Models** (requires `GOOGLE_GENERATIVE_AI_API_KEY`) - Models visible but will fail
  - Gemini 2.5 Flash Lite
  - Gemini 2.5 Flash
  - Gemini 2.5 Flash Thinking
  - Gemini 2.5 Pro
  - Gemini 2.5 Pro Thinking
  - Gemini 3 Flash
  - Gemini 3 Flash Thinking
  - Gemini 3 Pro
- ⚠️ **Flight Tracking** (requires `AMADEUS_API_KEY` + `AMADEUS_API_SECRET`) - Tool exists but will fail

**Available Features (You Have These API Keys):**
- ✅ **Stock & Currency Search** (have `VALYU_API_KEY`) - Currently hidden, can enable in `lib/utils.ts` line 82
- ✅ **Weather** (have `OPENWEATHER_API_KEY`)
- ✅ **Movies/TV** (have `TMDB_API_KEY`)
- ✅ **Google Maps** (have `GOOGLE_MAPS_API_KEY`)
- ✅ **Code Interpreter** (have `DAYTONA_API_KEY`)
- ✅ **Voice Features** (have `ELEVENLABS_API_KEY`)

**Recommendation:**
For a student/researcher-focused app, prioritize:
1. **Weather** - Useful for general queries
2. **Google Maps** - Helpful for location-based research
3. **Stock/Currency** - If financial research is needed
4. **Movies/TV** - Lower priority for educational use
5. **Flight Tracking** - Lower priority for educational use

---

---

## Platform-Specific Query Language Interfaces

### Concept
Create dedicated search interfaces similar to XQL for other platforms, providing focused, natural language search experiences.

### Potential Implementations

#### 1. RedditQL
**Description:** Natural language Reddit search interface

**Features:**
- Search Reddit posts and comments with natural language
- Filter by subreddit, time range, upvotes
- Display results with Reddit-specific formatting
- Direct links to original posts

**Existing Foundation:**
- ✅ Reddit search tool already exists (`lib/tools/reddit-search.ts`)
- ✅ Reddit UI component exists (`components/reddit-search.tsx`)
- ❌ Needs dedicated `/redditql` page and interface

---

#### 2. YouTubeQL
**Description:** Natural language YouTube search interface

**Features:**
- Search YouTube videos with natural language queries
- Filter by upload date, duration, channel
- Display video thumbnails and metadata
- Direct links to videos

**Existing Foundation:**
- ✅ YouTube search tool exists (`lib/tools/youtube-search.ts`)
- ✅ YouTube UI component exists (`components/youtube-search-results.tsx`)
- ❌ Needs dedicated `/youtubeql` page and interface

---

#### 3. AcademicQL
**Description:** Natural language academic paper search interface

**Features:**
- Search academic papers with natural language
- Filter by publication date, citations, authors
- Display paper abstracts and metadata
- Direct links to papers

**Existing Foundation:**
- ✅ Academic search tool exists (`lib/tools/academic-search.ts`)
- ✅ Academic papers UI component exists (`components/academic-papers.tsx`)
- ❌ Needs dedicated `/academicql` page and interface

---

#### 4. WebQL
**Description:** Enhanced natural language web search interface

**Features:**
- Advanced web search with natural language
- Multiple search strategies (extreme search, web search)
- Rich result display with snippets
- Source citations

**Existing Foundation:**
- ✅ Web search tool exists (`lib/tools/web-search.ts`)
- ✅ Extreme search tool exists (`lib/tools/extreme-search.ts`)
- ✅ Multiple search UI components exist
- ❌ Needs dedicated `/webql` page and interface

---

### Implementation Approach

**For each new QL interface:**

1. **Create dedicated page** (e.g., `/app/redditql/page.tsx`)
   - Copy XQL page structure as template
   - Customize for platform-specific features
   - Add platform-specific branding/icons

2. **Create layout file** (e.g., `/app/redditql/layout.tsx`)
   - Include sidebar navigation
   - Set appropriate metadata
   - Configure SEO

3. **Add to sidebar navigation** (`components/app-sidebar.tsx`)
   - Add menu item with appropriate icon
   - Consider beta label for new features
   - Group with other search tools

4. **Customize UI components**
   - Reuse existing platform components
   - Add example queries specific to platform
   - Customize result display

5. **Test and refine**
   - Test natural language query processing
   - Verify result display
   - Ensure mobile responsiveness

---

### Priority Ranking

**High Priority:**
- 🟢 **RedditQL** - Reddit is a popular platform, good complement to X search

**Medium Priority:**
- 🟡 **YouTubeQL** - Video search is valuable, but YouTube search is already well-integrated
- 🟡 **AcademicQL** - Useful for research-focused users

**Low Priority:**
- 🔵 **WebQL** - General web search is already well-covered in main chat interface

---

### Benefits

- **Focused User Experience:** Dedicated interfaces for specific use cases
- **Faster Access:** Direct navigation to platform-specific searches
- **Better Discoverability:** Users can easily find platform-specific features
- **Consistent UX:** Similar interface pattern across all QL tools
- **Marketing Differentiation:** Unique selling point for the app

---

### Considerations

- **Maintenance Overhead:** Each new QL interface adds code to maintain
- **User Confusion:** Too many options might overwhelm users
- **Feature Overlap:** Main chat interface already supports all these searches
- **Development Time:** Each interface requires design, development, and testing

---

### Alternative Approach

Instead of separate QL pages, consider:
- **Unified Search Hub:** Single page with tabs for different platforms
- **Search Filters:** Add platform filters to main chat interface
- **Quick Actions:** Platform-specific shortcuts in main interface

---

---

## X Wrapped: Permanent Storage & Sharing

### Concept
Save X Wrapped results permanently to database instead of only caching in Redis, enabling user history, shareable links, and better analytics.

### Current State
- ✅ X Wrapped generates AI-powered year/quarter analyses
- ✅ Results cached in Redis temporarily
- ❌ No permanent storage - results expire
- ❌ No user history of past analyses
- ❌ No shareable links
- ❌ No usage analytics

### Proposed Features

#### 1. Database Storage
- Create `x_wrapped_results` table to store analyses
- Save results after generation (alongside Redis cache)
- Include metadata: username, year, quarter, generated_at, user_id (optional)
- Store full analysis data (topics, sentiment, posts, etc.)

#### 2. User History Dashboard
- "My X Wrapped Analyses" page showing all past results
- Filter by username, year, quarter
- Quick access to previously generated analyses
- Delete/manage saved analyses

#### 3. Shareable Links
- Public URLs: `scira.ai/x-wrapped/username/2025/Q1`
- Optional: Private/unlisted links with share tokens
- Social media preview cards (Open Graph)
- Download as PDF or image for sharing

#### 4. Analytics & Insights
- Track most analyzed accounts
- Popular time periods (years/quarters)
- Usage trends over time
- "Trending analyses" feature

### Benefits

**For Users:**
- Never lose their analyses
- Share results with others
- Compare different time periods
- Build a portfolio of analyses

**For Product:**
- Viral sharing potential
- Better user engagement
- Usage analytics for improvement
- Monetization opportunities (Pro features)
- Permanent cache = cost savings

**For Students/Researchers:**
- Track influencer/brand evolution over time
- Cite analyses in research
- Build case studies
- Portfolio of analytical work

### Implementation Plan

1. **Database Schema** (30 min)
   - Create migration for `x_wrapped_results` table
   - Add indexes for efficient queries

2. **API Updates** (1 hour)
   - Save results to database after generation
   - Check database before Redis cache
   - Add endpoints for fetching user history

3. **History Page** (2 hours)
   - Create `/x-wrapped/history` page
   - Display user's past analyses
   - Add filters and search

4. **Shareable Links** (1 hour)
   - Update existing results page to load from database
   - Add share button with copy-to-clipboard
   - Generate social preview cards

5. **Analytics Dashboard** (optional, 2 hours)
   - Admin view of usage statistics
   - Trending analyses
   - Popular accounts/time periods

### Priority
🟢 **HIGH** - Adds significant value, enables sharing, improves UX, saves costs

---

## Status
💡 **IDEA** - Future consideration, not currently planned for development

## Next Steps
1. Gather user feedback on XQL usage
2. Determine if users want platform-specific interfaces
3. Prioritize based on user demand
4. Start with highest-priority platform if moving forward
