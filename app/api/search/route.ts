// /app/api/chat/route.ts
import {
  generateTitleFromUserMessage,
  getGroupConfig,
  getUserMessageCount,
  getSubDetails,
  getExtremeSearchUsageCount,
} from '@/app/actions';
import { serverEnv } from '@/env/server';
import { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { Daytona } from '@daytonaio/sdk';
import { tavily } from '@tavily/core';
import {
  convertToCoreMessages,
  streamText,
  tool,
  generateObject,
  NoSuchToolError,
  appendResponseMessages,
  CoreToolMessage,
  CoreAssistantMessage,
  createDataStream,
} from 'ai';
import Exa from 'exa-js';
import { z } from 'zod';
import MemoryClient from 'mem0ai';
import { extremeSearchTool } from '@/ai/extreme-search';
import { scira } from '@/ai/providers';
import { getUser } from '@/lib/auth-utils';
import {
  createStreamId,
  getChatById,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
  incrementExtremeSearchUsage,
  incrementMessageUsage,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import { SEARCH_LIMITS } from '@/lib/constants';
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream';
import { after } from 'next/server';
import { differenceInSeconds } from 'date-fns';
import { Chat } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { geolocation } from '@vercel/functions';
import { getTweet } from 'react-tweet/api';

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

function getTrailingMessageId({ messages }: { messages: Array<ResponseMessage> }): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(' > Resumable streams are disabled due to missing REDIS_URL');
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  RUB: '₽',
  KRW: '₩',
  BTC: '₿',
  THB: '฿',
  BRL: 'R$',
  PHP: '₱',
  ILS: '₪',
  TRY: '₺',
  NGN: '₦',
  VND: '₫',
  ARS: '$',
  ZAR: 'R',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  MXN: 'Mex$',
} as const;

interface GoogleResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface VideoDetails {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  type?: string;
  provider_name?: string;
  provider_url?: string;
}

interface VideoResult {
  videoId: string;
  url: string;
  details?: VideoDetails;
  captions?: string;
  timestamps?: string[];
  views?: string;
  likes?: string;
  summary?: string;
}

function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, '%20');
}

async function isValidImageUrl(url: string): Promise<{ valid: boolean; redirectedUrl?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        Accept: 'image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
      },
      redirect: 'follow', // Ensure redirects are followed
    });

    clearTimeout(timeout);

    // Log response details for debugging
    console.log(
      `Image validation [${url}]: status=${response.status}, content-type=${response.headers.get('content-type')}`,
    );

    // Capture redirected URL if applicable
    const redirectedUrl = response.redirected ? response.url : undefined;

    // Check if we got redirected (for logging purposes)
    if (response.redirected) {
      console.log(`Image was redirected from ${url} to ${redirectedUrl}`);
    }

    // Handle specific response codes
    if (response.status === 404) {
      console.log(`Image not found (404): ${url}`);
      return { valid: false };
    }

    if (response.status === 403) {
      console.log(`Access forbidden (403) - likely CORS issue: ${url}`);

      // Try to use proxy instead of whitelisting domains
      try {
        // Attempt to handle CORS blocked images by trying to access via proxy
        const controller = new AbortController();
        const proxyTimeout = setTimeout(() => controller.abort(), 5000);

        const proxyResponse = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(proxyTimeout);

        if (proxyResponse.ok) {
          const contentType = proxyResponse.headers.get('content-type');
          const proxyRedirectedUrl = proxyResponse.headers.get('x-final-url') || undefined;

          if (contentType && contentType.startsWith('image/')) {
            console.log(`Proxy validation successful for ${url}`);
            return {
              valid: true,
              redirectedUrl: proxyRedirectedUrl || redirectedUrl,
            };
          }
        }
      } catch (proxyError) {
        console.error(`Proxy validation failed for ${url}:`, proxyError);
      }
      return { valid: false };
    }

    if (response.status >= 400) {
      console.log(`Image request failed with status ${response.status}: ${url}`);
      return { valid: false };
    }

    // Check content type to ensure it's actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.log(`Invalid content type for image: ${contentType}, url: ${url}`);
      return { valid: false };
    }

    return { valid: true, redirectedUrl };
  } catch (error) {
    // Check if error is related to CORS
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('CORS') || errorMsg.includes('blocked by CORS policy')) {
      console.error(`CORS error for ${url}:`, errorMsg);

      // Try to use proxy instead of whitelisting domains
      try {
        // Attempt to handle CORS blocked images by trying to access via proxy
        const controller = new AbortController();
        const proxyTimeout = setTimeout(() => controller.abort(), 5000);

        const proxyResponse = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(proxyTimeout);

        if (proxyResponse.ok) {
          const contentType = proxyResponse.headers.get('content-type');
          const proxyRedirectedUrl = proxyResponse.headers.get('x-final-url') || undefined;

          if (contentType && contentType.startsWith('image/')) {
            console.log(`Proxy validation successful for ${url}`);
            return { valid: true, redirectedUrl: proxyRedirectedUrl };
          }
        }
      } catch (proxyError) {
        console.error(`Proxy validation failed for ${url}:`, proxyError);
      }
    }

    // Log the specific error
    console.error(`Image validation error for ${url}:`, errorMsg);
    return { valid: false };
  }
}

const extractDomain = (url: string): string => {
  const urlPattern = /^https?:\/\/([^/?#]+)(?:[/?#]|$)/i;
  return url.match(urlPattern)?.[1] || url;
};

const deduplicateByDomainAndUrl = <T extends { url: string },>(items: T[]): T[] => {
  const seenDomains = new Set<string>();
  const seenUrls = new Set<string>();

  return items.filter((item) => {
    const domain = extractDomain(item.url);
    const isNewUrl = !seenUrls.has(item.url);
    const isNewDomain = !seenDomains.has(domain);

    if (isNewUrl && isNewDomain) {
      seenUrls.add(item.url);
      seenDomains.add(domain);
      return true;
    }
    return false;
  });

export async function POST(req: Request) {
  console.log('🔍 Search API called');
  try {
    const { messages, model, group, timezone, id, selectedVisibilityType } = await req.json();
    const { latitude, longitude } = geolocation(req);

    console.log('--------------------------------');
    console.log('Location: ', latitude, longitude);
    console.log('--------------------------------');

    console.log('--------------------------------');
    console.log('Messages: ', messages);
    console.log('--------------------------------');

    const user = await getUser();
    const streamId = 'stream-' + uuidv4();

    if (!user) {
      console.log('User not found');
    }

    // Check if model requires authentication
    const authRequiredModels = ['scira-anthropic', 'scira-google'];
    if (authRequiredModels.includes(model) && !user) {
      return new ChatSDKError('unauthorized:model', `Authentication required to access ${model}`).toResponse();
    }

    // Check message count limit for non-pro users
    if (user) {
      console.log('📊 Checking usage limits');
      const [messageCountResult, subscriptionResult, extremeSearchUsage] = await Promise.all([
        getUserMessageCount(), // Check daily message count (deletion-proof tracking)
        getSubDetails(),
        getExtremeSearchUsageCount(),
      ]);

      if (messageCountResult.error) {
        console.error('❌ Error getting message count:', messageCountResult.error);
        console.error('Error getting message count:', messageCountResult.error);
        return new ChatSDKError('bad_request:api', 'Failed to verify usage limits').toResponse();
      }

      const isProUser = subscriptionResult.hasSubscription && subscriptionResult.subscription?.status === 'active';

      // Check if model requires Pro subscription
      const proRequiredModels = [
        'scira-grok-3',
        'scira-anthropic',
        'scira-anthropic-thinking',
        'scira-opus',
        'scira-opus-pro',
        'scira-google',
        'scira-google-pro',
      ];

      if (proRequiredModels.includes(model) && !isProUser) {
        return new ChatSDKError('upgrade_required:model', `${model} requires a Pro subscription`).toResponse();
      }

      // Check if user should bypass limits for free unlimited models
      const freeUnlimitedModels = ['scira-default', 'scira-vision'];
      const shouldBypassLimits = freeUnlimitedModels.includes(model);

      if (!isProUser && !shouldBypassLimits && messageCountResult.count >= SEARCH_LIMITS.DAILY_SEARCH_LIMIT) {
        return new ChatSDKError(
          'upgrade_required:chat',
          `Daily search limit of ${SEARCH_LIMITS.DAILY_SEARCH_LIMIT} exceeded`,
        ).toResponse();
      }

      // Check extreme search usage limit for non-pro users
      if (!isProUser && group === 'extreme') {
        if (extremeSearchUsage.count >= SEARCH_LIMITS.EXTREME_SEARCH_LIMIT) {
          return new ChatSDKError(
            'upgrade_required:api',
            `Daily extreme search limit of ${SEARCH_LIMITS.EXTREME_SEARCH_LIMIT} exceeded`,
          ).toResponse();
        }
      }
    }

    const { tools: activeTools, instructions } = await getGroupConfig(group);

    if (user) {
      const chat = await getChatById({ id });

      if (!chat) {
        const title = await generateTitleFromUserMessage({
          message: messages[messages.length - 1],
        });

        console.log('--------------------------------');
        console.log('Title: ', title);
        console.log('--------------------------------');

        // Create a new chat
        console.log('📝 Creating new chat');
        await saveChat({
          id,
          userId: user.id,
          title,
          visibility: selectedVisibilityType,
        });
      } else {
        if (chat.userId !== user.id) {
          return new ChatSDKError('forbidden:chat', 'This chat belongs to another user').toResponse();
        }
      }

      // Save the message
      console.log('💾 Saving message to database');
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: messages[messages.length - 1].id,
            role: 'user',
            parts: messages[messages.length - 1].parts,
            attachments: messages[messages.length - 1].experimental_attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });

      console.log('--------------------------------');
      console.log('Messages saved: ', messages);
      console.log('--------------------------------');

      await createStreamId({ streamId, chatId: id });
    }

    console.log('--------------------------------');
    console.log('Messages: ', messages);
    console.log('--------------------------------');
    console.log('Running with model: ', model.trim());
    console.log('Group: ', group);
    console.log('Timezone: ', timezone);

    const stream = createDataStream({
      execute: async (dataStream) => {
        const result = streamText({
          model: scira.languageModel(model),
          messages: convertToCoreMessages(messages),
          maxTokens: 12000,
          ...(model.includes('scira-qwq') || model.includes('scira-qwen-32b')
            ? {
              temperature: 0.6,
              topP: 0.95,
            }
            : {
              temperature: 0,
            }),
          maxSteps: 5,
          maxRetries: 5,
          experimental_activeTools: [...activeTools],
          system: instructions + `\n\nThe user's location is ${latitude}, ${longitude}.`,
          toolChoice: 'auto',
          providerOptions: {
            openai: {
              ...(model === 'scira-o4-mini' || model === 'scira-o3'
                ? {
                  reasoningEffort: 'medium',
                  strictSchemas: true,
                  reasoningSummary: 'detailed',
                }
                : {}),
              ...(model === 'scira-4o-mini'
                ? {
                  parallelToolCalls: false,
                  strictSchemas: true,
                }
                : {}),
            } as OpenAIResponsesProviderOptions,
            xai: {
              ...(model === 'scira-default'
                ? {
                  reasoningEffort: 'low',
                }
                : {}),
            },
            anthropic: {
              ...(model === 'scira-anthropic-thinking' || model === 'scira-opus-pro'
                ? {
                  thinking: { type: 'enabled', budgetTokens: 12000 },
                }
                : {}),
            },
          },
          tools: {
            stock_chart: tool({
              description: 'Get stock data and news for given stock symbols.',
              parameters: z.object({
                title: z.string().describe('The title of the chart.'),
                news_queries: z.array(z.string()).describe('The news queries to search for.'),
                icon: z.enum(['stock', 'date', 'calculation', 'default']).describe('The icon to display for the chart.'),
                stock_symbols: z.array(z.string()).describe('The stock symbols to display for the chart.'),
                currency_symbols: z
                  .array(z.string())
                  .describe(
                    'The currency symbols for each stock/asset in the chart. Available symbols: ' +
                    Object.keys(CURRENCY_SYMBOLS).join(', ') +
                    '. Defaults to USD if not provided.',
                  ),
                interval: z
                  .enum(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'])
                  .describe('The interval of the chart. default is 1y.'),
              }),
              execute: async ({
                title,
                icon,
                stock_symbols,
                currency_symbols,
                interval,
                news_queries,
              }: {
                title: string;
                icon: string;
                stock_symbols: string[];
                currency_symbols?: string[];
                interval: string;
                news_queries: string[];
              }) => {
                console.log('Title:', title);
                console.log('Icon:', icon);
                console.log('Stock symbols:', stock_symbols);
                console.log('Currency symbols:', currency_symbols);
                console.log('Interval:', interval);
                console.log('News queries:', news_queries);

                // Format currency symbols with actual symbols
                const formattedCurrencySymbols = (currency_symbols || stock_symbols.map(() => 'USD')).map((currency) => {
                  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS];
                  return symbol || currency; // Fallback to currency code if symbol not found
                });

                interface NewsResult {
                  title: string;
                  url: string;
                  content: string;
                  published_date?: string;
                  category: string;
                  query: string;
                }

                interface NewsGroup {
                  query: string;
                  topic: string;
                  results: NewsResult[];
                }

                let news_results: NewsGroup[] = [];

                const tvly = tavily({ apiKey: serverEnv.TAVILY_API_KEY });

                // Gather all news search promises to execute in parallel
                const searchPromises = [];
                for (const query of news_queries) {
                  // Add finance and news topic searches for each query
                  searchPromises.push({
                    query,
                    topic: 'finance',
                    promise: tvly.search(query, {
                      topic: 'finance',
                      days: 7,
                      maxResults: 3,
                      searchDepth: 'advanced',
                    }),
                  });

                  searchPromises.push({
                    query,
                    topic: 'news',
                    promise: tvly.search(query, {
                      topic: 'news',
                      days: 7,
                      maxResults: 3,
                      searchDepth: 'advanced',
                    }),
                  });
                }

                // Execute all searches in parallel
                const searchResults = await Promise.all(
                  searchPromises.map(({ promise }) =>
                    promise.catch((err) => ({
                      results: [],
                      error: err.message,
                    })),
                  ),
                );

                // Process results and deduplicate
                const urlSet = new Set();
                searchPromises.forEach(({ query, topic }, index) => {
                  const result = searchResults[index];
                  if (!result.results) return;

                  const processedResults = result.results
                    .filter((item) => {
                      // Skip if we've already included this URL
                      if (urlSet.has(item.url)) return false;
                      urlSet.add(item.url);
                      return true;
                    })
                    .map((item) => ({
                      title: item.title,
                      url: item.url,
                      content: item.content.slice(0, 30000),
                      published_date: item.publishedDate,
                      category: topic,
                      query: query,
                    }));

                  if (processedResults.length > 0) {
                    news_results.push({
                      query,
                      topic,
                      results: processedResults,
                    });
                  }
                });

                // Perform Exa search for financial reports
                const exaResults: NewsGroup[] = [];
                try {
                  // Run Exa search for each stock symbol
                  const exaSearchPromises = stock_symbols.map((symbol) =>
                    exa
                      .searchAndContents(`${symbol} financial report analysis`, {
                        text: true,
                        category: 'financial report',
                        livecrawl: 'always',
                        type: 'auto',
                        numResults: 10,
                        summary: {
                          query: 'all important information relevent to the important for investors',
                        },
                      })
                      .catch((error) => {
                        console.error(`Exa search error for ${symbol}:`, error);
                        return { results: [] };
                      }),
                  );

                  const exaSearchResults = await Promise.all(exaSearchPromises);

                  // Process Exa results
                  const exaUrlSet = new Set();
                  exaSearchResults.forEach((result, index) => {
                    if (!result.results || result.results.length === 0) return;

                    const stockSymbol = stock_symbols[index];
                    const processedResults = result.results
                      .filter((item) => {
                        if (exaUrlSet.has(item.url)) return false;
                        exaUrlSet.add(item.url);
                        return true;
                      })
                      .map((item) => ({
                        title: item.title || '',
                        url: item.url,
                        content: item.summary || '',
                        published_date: item.publishedDate,
                        category: 'financial',
                        query: stockSymbol,
                      }));

                    if (processedResults.length > 0) {
                      exaResults.push({
                        query: stockSymbol,
                        topic: 'financial',
                        results: processedResults,
                      });
                    }
                  });

                  // Complete missing titles for financial reports
                  for (const group of exaResults) {
                    for (let i = 0; i < group.results.length; i++) {
                      const result = group.results[i];
                      if (!result.title || result.title.trim() === '') {
                        try {
                          const { object } = await generateObject({
                            model: scira.languageModel('scira-nano'),
                            prompt: `Complete the following financial report with an appropriate title. The report is about ${group.query
                              } and contains this content: ${result.content.substring(0, 500)}...`,
                            schema: z.object({
                              title: z.string().describe('A descriptive title for the financial report'),
                            }),
                          });
                          group.results[i].title = object.title;
                        } catch (error) {
                          console.error(`Error generating title for ${group.query} report:`, error);
                          group.results[i].title = `${group.query} Financial Report`;
                        }
                      }
                    }
                  }

                  // Merge Exa results with news results
                  news_results = [...news_results, ...exaResults];
                } catch (error) {
                  console.error('Error fetching Exa financial reports:', error);
                }

                const code = `
import yfinance as yf
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime

${stock_symbols
                  .map(
                    (symbol) =>
                      `${symbol.toLowerCase().replace('.', '')} = yf.download('${symbol}', period='${interval}', interval='1d')`,
                  )
                  .join('\n')}

# Create the plot
plt.figure(figsize=(10, 6))
${stock_symbols
                  .map(
                    (symbol) => `
# Convert datetime64 index to strings to make it serializable
${symbol.toLowerCase().replace('.', '')}.index = ${symbol.toLowerCase().replace('.', '')}.index.strftime('%Y-%m-%d')
plt.plot(${symbol.toLowerCase().replace('.', '')}.index, ${symbol
                        .toLowerCase()
                        .replace('.', '')}['Close'], label='${symbol} ${formattedCurrencySymbols[stock_symbols.indexOf(symbol)]
                      }', color='blue')
`,
                  )
                  .join('\n')}

# Customize the chart
plt.title('${title}')
plt.xlabel('Date')
plt.ylabel('Closing Price')
plt.legend()
plt.grid(True)
plt.show()`;

                console.log('Code:', code);

                const daytona = new Daytona({
                  apiKey: serverEnv.DAYTONA_API_KEY,
                  target: 'us',
                });

                const sandbox = await daytona.create(
                  {
                    snapshot: 'scira-analysis:1751171803',
                  }
                );

                const execution = await sandbox.process.codeRun(code);
                let message = '';

                if (execution.result === execution.artifacts?.stdout) {
                  message += execution.result;
                } else if (execution.result && execution.result !== execution.artifacts?.stdout) {
                  message += execution.result;
                } else if (execution.artifacts?.stdout && execution.artifacts?.stdout !== execution.result) {
                  message += execution.artifacts.stdout;
                } else {
                  message += execution.result;
                }

                console.log('Execution:', execution.result);
                console.log('Execution:', execution.artifacts?.stdout);

                console.log('Chart details: ', execution.artifacts?.charts);
                if (execution.artifacts?.charts) {
                  console.log('Showing chart');
                  execution.artifacts.charts[0].elements.map((element: any) => {
                    console.log(element.points);
                  });
                }

                if (execution.artifacts?.charts === undefined) {
                  console.log('No chart found');
                }

                await sandbox.delete();

                // Map the chart to the correct format for the frontend and remove the png property
                const chart = execution.artifacts?.charts?.[0] ?? undefined;
                const chartData = chart
                  ? {
                    type: chart.type,
                    title: chart.title,
                    elements: chart.elements,
                    png: undefined,
                  }
                  : undefined;

                return {
                  message: message.trim(),
                  chart: chartData,
                  currency_symbols: formattedCurrencySymbols,
                  news_results: news_results,
                };
              },
            }),
            // ...
          },
        },
        experimental_repairToolCall: async ({ toolCall, tools, parameterSchema, error }) => {
          if (NoSuchToolError.isInstance(error)) {
            return null; // Do not attempt to fix invalid tool names
          }

          console.log('Fixing tool call================================');
          console.log('Tool call:', toolCall);
          console.log('Tools:', tools);
          console.log('Parameter schema:', parameterSchema);
          console.log('Error:', error);

          const tool = tools[toolCall.toolName as keyof typeof tools];

          const { object: repairedArgs } = await generateObject({
            model: scira.languageModel('scira-default'),
            schema: tool.parameters,
            prompt: [
              `The model tried to call the tool "${toolCall.toolName}"` + ` with the following arguments:`,
              JSON.stringify(toolCall.args),
              `The tool accepts the following schema:`,
              JSON.stringify(parameterSchema(toolCall)),
              'Please fix the arguments.',
              'Do not use print statements stock chart tool.',
              `For the stock chart tool you have to generate a python code with matplotlib and yfinance to plot the stock chart.`,
              `For the web search make multiple queries to get the best results.`,
              `Today's date is ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`,
            ].join('\n'),
          });

          console.log('Repaired arguments:', repairedArgs);

          return { ...toolCall, args: JSON.stringify(repairedArgs) };
        },
        onChunk(event) {
          if (event.chunk.type === 'tool-call') {
            console.log('Called tool:', event.chunk.toolName);
          }
        },
        onStepFinish(event) {
          if (event.warnings) {
            console.log('Warnings:', event.warnings);
          }
        },
        onFinish: async (event) => {
          console.log('Finish reason:', event.finishReason);
          console.log('Reasoning:', event.reasoning);
          console.log('Reasoning details:', event.reasoningDetails);
          console.log('Steps:', event.steps);
          console.log('Messages:', event.response.messages);
          console.log('Response body:', event.response.body);
          console.log('Provider metadata:', event.providerMetadata);
          console.log('Sources:', event.sources);

          // Track message usage for rate limiting (deletion-proof)
          // Only track usage for models that are not free unlimited
          if (user?.id) {
            try {
              const freeUnlimitedModels = ['scira-default', 'scira-vision'];
              if (!freeUnlimitedModels.includes(model)) {
                await incrementMessageUsage({ userId: user.id });
              }
            } catch (error) {
              console.error('Failed to track message usage:', error);
            }
          }

          // Track extreme search usage if it was used successfully
          if (user?.id && group === 'extreme') {
            try {
              // Check if extreme_search tool was actually called
              const extremeSearchUsed = event.steps?.some((step) =>
                step.toolCalls?.some((toolCall) => toolCall.toolName === 'extreme_search'),
              );

              if (extremeSearchUsed) {
                console.log('Extreme search was used successfully, incrementing count');
                await incrementExtremeSearchUsage({ userId: user.id });
              }
            } catch (error) {
              console.error('Failed to track extreme search usage:', error);
            }
          }

          if (user?.id) {
            try {
              const assistantId = getTrailingMessageId({
                messages: event.response.messages.filter((message: any) => message.role === 'assistant'),
              });

              if (!assistantId) {
                throw new Error('No assistant message found!');
              }

              const [, assistantMessage] = appendResponseMessages({
                messages: [messages[messages.length - 1]],
                responseMessages: event.response.messages,
              });

              console.log('Assistant message [annotations]:', assistantMessage.annotations);

              await saveMessages({
                messages: [
                  {
                    id: assistantId,
                    chatId: id,
                    role: assistantMessage.role,
                    parts: assistantMessage.parts,
                    attachments: assistantMessage.experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              });
            } catch (_) {
              console.error('Failed to save chat');
            }
          }
        },
        onError(event) {
          console.log('Error:', event.error);
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError(error) {
      console.log('Error:', error);
      if (error instanceof Error && error.message.includes('Rate Limit')) {
        return 'Oops, you have reached the rate limit! Please try again later.';
      }
      return 'Oops, an error occurred!';
    },
  });
  const streamContext = getStreamContext();

  if (streamContext) {
    return new Response(await streamContext.resumableStream(streamId, () => stream));
  } else {
    return new Response(stream);
  }
}

export async function GET(request: Request) {
  console.log('🔍 Search API GET called');
  try {
    const streamContext = getStreamContext();
    const resumeRequestedAt = new Date();

    if (!streamContext) {
      return new Response(null, { status: 204 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return new ChatSDKError('bad_request:api', 'Chat ID is required').toResponse();
    }

    const session = await auth.api.getSession(request);

    if (!session?.user) {
      console.log('❌ No user session found');
      return new ChatSDKError('unauthorized:auth', 'Authentication required to resume chat stream').toResponse();
    }

    let chat: Chat | null;

    try {
      chat = await getChatById({ id: chatId });
    } catch {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (!chat) {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat', 'Access denied to private chat').toResponse();
    }

    const streamIds = await getStreamIdsByChatId({ chatId });

    if (!streamIds.length) {
      return new ChatSDKError('not_found:stream').toResponse();
    }

    const recentStreamId = streamIds.at(-1);

    if (!recentStreamId) {
      return new ChatSDKError('not_found:stream').toResponse();
    }

    const emptyDataStream = createDataStream({
      execute: () => { },
    });

    const stream = await streamContext.resumableStream(recentStreamId, () => emptyDataStream);

    /*
     * For when the generation is streaming during SSR
     * but the resumable stream has concluded at this point.
     */
    if (!stream) {
      const messages = await getMessagesByChatId({ id: chatId });
      const mostRecentMessage = messages.at(-1);

      if (!mostRecentMessage) {
        return new Response(emptyDataStream, { status: 200 });
      }

      if (mostRecentMessage.role !== 'assistant') {
        return new Response(emptyDataStream, { status: 200 });
      }

      const messageCreatedAt = new Date(mostRecentMessage.createdAt);

      if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
        return new Response(emptyDataStream, { status: 200 });
      }

      const restoredStream = createDataStream({
        execute: (buffer) => {
          buffer.writeData({
            type: 'append-message',
            message: JSON.stringify(mostRecentMessage),
          });
        },
      });

      return new Response(restoredStream, { status: 200 });
    }

    return new Response(stream, { status: 200 });
  } catch (error) {
    console.error('❌ Search API GET error:', error);
    return new ChatSDKError('bad_request:api', 'Failed to process request').toResponse();
  }
}
