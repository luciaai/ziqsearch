# External API Cost Tracking Implementation Plan

## Overview
Add cost tracking for all external APIs to get accurate total costs in the admin dashboard.

## APIs to Track

### Search APIs
- [x] **Parallel** (`parallel-search`) - $0.01 per request
  - File: `lib/tools/web-search.ts`
  - Track after each `parallel.search()` call
  
- [ ] **Exa** (`exa-search`) - $0.005 per search
  - File: `lib/tools/web-search.ts`, `lib/tools/extreme-search.ts`
  - Track after each `exa.search()` or `exa.searchAndContents()` call
  
- [ ] **Firecrawl** (`firecrawl-search`, `firecrawl-scrape`) - $0.003-0.005 per request
  - Files: `lib/tools/web-search.ts`, `lib/tools/academic-search.ts`, `lib/tools/extreme-search.ts`
  - Track after each `firecrawl.search()` or `firecrawl.scrapeUrl()` call
  
- [ ] **Tavily** (`tavily-search`) - $0.01 per search
  - File: `lib/tools/web-search.ts`
  - Track after each `tavily.search()` call

### Data APIs
- [ ] **Supadata** (`supadata-youtube`) - $0.002 per request
  - File: `lib/tools/youtube-search.ts`
  - Track after each `supadata.youtube.search()` call
  
- [ ] **Valyu** (`valyu-stock`) - $0.001 per request
  - File: `lib/tools/stock-chart.ts`
  - Track after each `valyu.getStockData()` call
  
- [ ] **CoinGecko** (`coingecko-pro`) - $0.0005 per request
  - File: `lib/tools/crypto-tools.ts`
  - Track after each API call
  
- [ ] **TMDB** (`tmdb-api`) - Free (track for monitoring)
  - File: `lib/tools/movie-tv-search.ts`
  
- [ ] **OpenWeather** (`openweather-api`) - $0.0001 per request
  - File: `lib/tools/weather.ts`

### Compute APIs
- [ ] **Daytona** (`daytona-sandbox`) - $0.05 per execution
  - File: `lib/tools/extreme-search.ts`, `lib/tools/code-interpreter.ts`
  - Track after each sandbox execution

### Other APIs
- [ ] **Amadeus** (`amadeus-flight`) - $0.002 per request
  - File: `lib/tools/flight-tracker.ts`
  
- [ ] **Google Maps** (`google-maps`) - $0.005 per request
  - File: `lib/tools/map-tools.ts`

## Implementation Steps

1. ✅ Add `EXTERNAL_API_PRICING` to `lib/api-cost-tracker.ts`
2. ✅ Create `trackExternalApiCost()` function
3. ✅ Import tracking function in `lib/tools/web-search.ts`
4. [ ] Add tracking calls to each tool file (see list above)
5. [ ] Test in development
6. [ ] Verify costs appear in admin dashboard

## Usage Pattern

```typescript
import { trackExternalApiCost } from '../api-cost-tracker';

// After making API call
await trackExternalApiCost({
  userId: userId,
  apiName: 'exa-search',
  requestCount: queries.length, // Number of requests made
  messageId: messageId,
  searchType: 'normal', // or 'extreme'
});
```

## Notes
- Don't throw errors if tracking fails - use try/catch
- Track after successful API calls only
- For batch requests, track the total count
- Store request count in `inputTokens` field for external APIs
