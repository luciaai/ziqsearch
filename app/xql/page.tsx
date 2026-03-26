'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Loader2, Copy, Check, X, History, ChevronDown } from 'lucide-react';
import { CodeIcon, XLogoIcon } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Tweet } from 'react-tweet';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { XQLProUpgradeScreen } from '@/components/xql-pro-upgrade-screen';
import { BorderTrail } from '@/components/core/border-trail';
import { TextShimmer } from '@/components/core/text-shimmer';
import { cn } from '@/lib/utils';
import { type XQLMessage } from '@/app/api/xql/route';
import { highlight } from 'sugar-high';
import { SciraLogo } from '@/components/logos/scira-logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { v7 as uuidv7 } from 'uuid';

const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = 'xql-query-history';

function XQLPageContent() {
  const [input, setInput] = useState<string>('');
  const [copiedResult, setCopiedResult] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, isProUser, isLoading: isProStatusLoading } = useUser();
  const router = useRouter();

  // Load query history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQueryHistory(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load query history:', err);
    }
  }, []);

  // Save query to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setQueryHistory((prev) => {
      // Remove duplicates and add to front
      const filtered = prev.filter((q) => q !== query);
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save query history:', err);
      }
      
      return updated;
    });
  }, []);

  // Clear query history
  const clearHistory = useCallback(() => {
    setQueryHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear query history:', err);
    }
    toast.success('Query history cleared');
  }, []);

  const { messages, sendMessage, status } = useChat<XQLMessage>({
    transport: new DefaultChatTransport({
      api: '/api/xql',
    }),
    generateId: () => uuidv7(),
    onError: (error) => {
      toast.error('Query failed', {
        description: error.message,
      });
    },
  });

  const handleRun = useCallback(async () => {
    if (!input.trim() || status !== 'ready') return;

    // Save to history before running
    saveToHistory(input);

    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: `Convert this natural language query to SQL: ${input}` }],
    });
  }, [input, status, sendMessage, saveToHistory]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun],
  );

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResult(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }, []);

  React.useEffect(() => {
    if (!isProStatusLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, router, isProStatusLoading]);

  const lastMessage = messages[messages.length - 1];

  if (!isProStatusLoading && !isProUser) {
    return <XQLProUpgradeScreen />;
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-background overflow-x-hidden transition-[justify-content,align-items] duration-700 ease-in-out',
        messages.length === 0 ? 'flex items-center justify-center' : '',
      )}
    >
      <div
        className={cn(
          'max-w-3xl w-full mx-auto px-4 transition-[padding] duration-700 ease-in-out',
          messages.length === 0 ? 'py-12 sm:py-14' : 'pt-12 sm:pt-14 pb-12 sm:pb-10',
        )}
      >
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-5xl font-be-vietnam-pro -tracking-normal font-medium relative">
            {/* Mobile sidebar trigger */}
            <div className="md:hidden absolute left-0">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <XLogoIcon className="size-6 sm:size-8 md:size-12 text-foreground font-medium" />
              <h1 className="text-foreground">Explorer</h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto">
            Search X/Twitter posts using natural language queries with advanced filters
          </p>
        </div>

        <div className="flex items-center gap-2 w-full">
          {queryHistory.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 sm:h-11 px-3 rounded-full border-border hover:bg-muted/50 shrink-0"
                  disabled={isProStatusLoading || status !== 'ready'}
                >
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px] sm:w-[320px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Recent Queries</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {queryHistory.map((query, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setInput(query)}
                    className="cursor-pointer text-sm"
                  >
                    <div className="flex items-start gap-2 w-full min-w-0">
                      <XLogoIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="truncate flex-1">{query}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="flex items-center gap-2 border border-border rounded-full px-3 sm:px-4 py-2 bg-muted/20 flex-1">
            <XLogoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
          <div className="relative flex-1 min-w-0 m-0! p-0!">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask in natural language…"
              disabled={isProStatusLoading || status !== 'ready'}
              maxLength={200}
              className="w-full border-0 p-0 focus-visible:ring-0 text-sm sm:text-base bg-transparent! pr-12 sm:pr-14 shadow-none placeholder:text-muted-foreground"
            />
            {input.trim() && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInput('')}
                className="absolute size-8 sm:size-9 right-0 top-1/2 -translate-y-1/2 rounded-full p-0! m-0!"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            </div>
            {input.trim() && <div className="w-px h-8 sm:h-9 bg-border shrink-0 self-center rounded" />}
            <Button
            onClick={handleRun}
            disabled={!input.trim() || status !== 'ready' || isProStatusLoading}
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-full font-semibold text-xs sm:text-sm"
          >
            {status === 'streaming' || status === 'submitted' ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            </Button>
          </div>
        </div>

        {isProStatusLoading && (
          <div className="mt-8 space-y-4">
            <div className="text-center space-y-2">
              <div className="h-4 w-48 bg-muted rounded mx-auto animate-pulse" />
              <div className="h-3 w-64 bg-muted/60 rounded mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-none animate-pulse p-0">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 bg-muted rounded" />
                      <div className="h-3 w-3 bg-muted rounded ml-auto" />
                    </div>
                    <div className="h-4 w-full bg-muted rounded mb-1" />
                    <div className="h-3 w-2/3 bg-muted/60 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && status === 'ready' && !isProStatusLoading && (
          <div className="mt-8 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">Try these search queries</p>
              <p className="text-xs text-muted-foreground">Search X posts with natural language and advanced filters</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  query: 'Posts from @elonmusk about Tesla',
                  description: 'Combine user filter with topic search',
                },
                {
                  query: 'AI developments from past 3 days',
                  description: 'Recent posts on trending topics',
                },
                {
                  query: 'Posts from @openai @anthropicai about GPT',
                  description: 'Multiple users discussing a topic',
                },
                {
                  query: 'Machine learning research from this month',
                  description: 'Topic search with time filter',
                },
                {
                  query: 'Funny cat videos from this week',
                  description: 'Recent posts on popular topics',
                },
                {
                  query: 'Tech news from @verge @techcrunch today',
                  description: 'Multiple sources with date filter',
                },
              ].map((example, i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary/30 shadow-none group p-0 transition-colors"
                  onClick={() => setInput(example.query)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 rounded bg-secondary shrink-0">
                        <XLogoIcon className="h-3 w-3 text-foreground" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 ml-auto transition-opacity">
                        <Play className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-1 font-medium leading-tight">{example.query}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{example.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl border border-border/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <CodeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="text-xs sm:text-sm text-foreground/90 space-y-2">
                  <p className="font-semibold text-foreground text-sm sm:text-base">Advanced Filtering</p>
                  <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Date ranges:</strong> Use natural language like "last week" or ISO format (YYYY-MM-DD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>User handles:</strong> Include or exclude up to 10 users (e.g., @username)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Topics:</strong> Search by keywords, hashtags, or subject matter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong>Combinations:</strong> Mix filters for precise results</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="mt-8 space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Show loading state */}
            {(status === 'streaming' || status === 'submitted') && (
              <Card className="relative w-full h-[80px] sm:h-[100px] my-4 overflow-hidden shadow-none p-0">
                <BorderTrail className={cn('bg-linear-to-r from-primary/20 via-primary to-primary/20')} size={80} />
                <CardContent className="px-4 py-4 sm:px-6 sm:py-6">
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        'relative h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-primary/10 shrink-0',
                      )}
                    >
                      <BorderTrail
                        className={cn('bg-linear-to-r from-primary/20 via-primary to-primary/20')}
                        size={40}
                      />
                      {lastMessage &&
                      lastMessage.parts.some(
                        (part) =>
                          part.type === 'tool-xql' &&
                          (part.state === 'input-streaming' || part.state === 'input-available'),
                      ) ? (
                        <CodeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      ) : (
                        <XLogoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                      <TextShimmer className="text-sm sm:text-base font-medium" duration={2}>
                        {lastMessage &&
                        lastMessage.parts.some(
                          (part) =>
                            part.type === 'tool-xql' &&
                            (part.state === 'input-streaming' || part.state === 'input-available'),
                        )
                          ? 'Executing search...'
                          : 'Processing query...'}
                      </TextShimmer>
                      <div className="flex gap-1 sm:gap-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-1 sm:h-1.5 rounded-full bg-muted animate-pulse"
                            style={{
                              width: `${Math.random() * 30 + 15}px`,
                              animationDelay: `${i * 0.2}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show the citations */}
            {lastMessage &&
              lastMessage.parts.map((part, index) => {
                if (part.type === 'tool-xql' && part.state === 'output-available') {
                  const citations = 'output' in part && Array.isArray(part.output) ? part.output : [];
                  return (
                    <Card key={index} className="p-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <SciraLogo className="size-6 text-foreground shrink-0" />
                            <span className="font-semibold text-foreground text-sm sm:text-base">
                              Ziq found {citations.length} Posts
                            </span>
                          </div>

                          {citations.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(citations.join('\n'))}
                              className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 shrink-0"
                            >
                              {copiedResult ? (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                          {citations.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              {citations.map((url: string | null, i: number) => {
                                if (!url) {
                                  return null;
                                }
                                // Extract tweet ID from URL
                                const tweetIdMatch = url?.match(/\/status\/(\d+)/);
                                const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

                                if (tweetId) {
                                  return (
                                    <div key={i} className="w-full max-w-lg sm:max-w-xl tweet-wrapper-sheet">
                                      <Tweet id={tweetId} />
                                    </div>
                                  );
                                }

                                // Fallback for URLs that don't match tweet pattern
                                return (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    className="flex items-center gap-3 p-3 sm:p-4 bg-muted/20 hover:bg-muted/30 border border-border rounded-lg group max-w-lg sm:max-w-xl w-full transition-colors"
                                  >
                                    <XLogoIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                                        {url.replace('https://x.com/', '').replace('https://twitter.com/', '')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {url.startsWith('https://x.com') ? 'x.com' : 'twitter.com'}
                                      </p>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground">
                              <XLogoIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                              <p className="text-sm sm:text-base">No X citations found for this query</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}

            {/* Show errors */}
            {lastMessage &&
              lastMessage.parts.map((part, index) => {
                if (part.type === 'tool-xql' && part.state === 'output-error') {
                  return (
                    <Card key={index} className="border-destructive shadow-none">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3 text-destructive">
                          <XLogoIcon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base">Search Error</p>
                            <p className="text-xs sm:text-sm leading-relaxed">
                              {'errorText' in part ? part.errorText : 'Unknown error occurred'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function XQLPage() {
  return <XQLPageContent />;
}
