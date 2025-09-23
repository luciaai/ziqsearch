'use client';

import React, { useState, memo, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Globe,
  GlobeHemisphereWest,
  Lock,
  Copy,
  Check,
  Crown,
  Lightning,
  Eye,
  DotsThree,
  Share,
  Shield,
} from '@phosphor-icons/react';
import { Coins, CreditCard, HelpCircle, History, Info, Mail, Menu, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/user-profile';
import { ChatHistoryButton } from '@/components/chat-history-dialog';
import { AdminPanel } from '@/components/admin-panel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { User } from '@/lib/db/schema';
import { LinkedinLogo, RedditLogo, XLogo } from '@phosphor-icons/react';
import { ClassicLoader } from '@/components/ui/loading';
import { ThemeToggle } from '@/components/theme-toggle';

type VisibilityType = 'public' | 'private';

interface NavbarProps {
  isDialogOpen?: boolean;
  chatId?: string | null;
  selectedVisibilityType?: VisibilityType;
  onVisibilityChange?: (visibility: VisibilityType) => void | Promise<void>;
  status?: string;
  user?: User | null;
  onHistoryClick?: () => void;
  isOwner?: boolean;
  subscriptionData?: any;
  isProUser?: boolean;
  isProStatusLoading?: boolean;
}

const Navbar = memo(
  ({
    isDialogOpen = false,
    chatId = null,
    selectedVisibilityType = 'private',
    onVisibilityChange = () => {},
    status = 'ready',
    user = null,
    onHistoryClick = () => {},
    isOwner = true,
    subscriptionData,
    isProUser = false,
    isProStatusLoading = false,
  }: NavbarProps) => {
    const [copied, setCopied] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [privateDropdownOpen, setPrivateDropdownOpen] = useState(false);
    const [isChangingVisibility, setIsChangingVisibility] = useState(false);
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [isLoadingCredits, setIsLoadingCredits] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Function to get the user ID from localStorage or cookies
    const getUserId = () => {
      if (typeof window === 'undefined') return null;
      
      // Try to get from localStorage first
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('Found userId in localStorage:', storedUserId);
        return storedUserId;
      }
      
      // Try to get from cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
          console.log('Found userId in cookies:', value);
          return value;
        }
      }
      
      return null;
    };
    
    useEffect(() => {
      async function fetchCredits() {
        try {
          setIsLoadingCredits(true);
          console.log("Fetching credits...");
          
          // Get the user ID
          const userId = getUserId();
          
          // Prepare headers with authentication if we have a user ID
          const headers: HeadersInit = {};
          if (userId) {
            headers['Authorization'] = `Bearer ${userId}`;
          }
          
          const response = await fetch('/api/debug/credits', { headers });
          const data = await response.json();
          console.log("Credits API response:", data);
          
          // Set credits directly
          setUserCredits(data.credits);
          console.log("Set userCredits to:", data.credits);
          
          // Check if user is admin
          if (data.isAdmin) {
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error fetching credits:', error);
        } finally {
          setIsLoadingCredits(false);
        }
      }

      if (user) {
        fetchCredits();
        const interval = setInterval(fetchCredits, 5000);
        return () => clearInterval(interval);
      }
    }, [user]);

    // Use passed Pro status instead of calculating it
    const hasActiveSubscription = isProUser;

    const handleCopyLink = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!chatId) return;

      const url = `https://ziqsearch.com/search/${chatId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');

      setTimeout(() => setCopied(false), 2000);
    };

    // Generate the share URL
    const shareUrl = chatId ? `https://ziqsearch.com/search/${chatId}` : '';

    // Social media share handlers
    const handleShareLinkedIn = (e: React.MouseEvent) => {
      e.preventDefault();
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShareTwitter = (e: React.MouseEvent) => {
      e.preventDefault();
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    const handleShareReddit = (e: React.MouseEvent) => {
      e.preventDefault();
      const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`;
      window.open(redditUrl, '_blank', 'noopener,noreferrer');
    };

    const handleVisibilityChange = async (newVisibility: VisibilityType) => {
      setIsChangingVisibility(true);
      try {
        await onVisibilityChange(newVisibility);
        // If changing from private to public, open the public dropdown immediately
        if (newVisibility === 'public') {
          setDropdownOpen(true);
        }
      } finally {
        setIsChangingVisibility(false);
        setPrivateDropdownOpen(false);
      }
    };

    const AboutButton = () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8 bg-background dark:bg-muted border-border dark:border-muted hover:bg-muted/50 dark:hover:bg-muted/80 transition-all"
            >
              <Menu className="h-5 w-5 text-foreground/70 dark:text-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] mt-1" sideOffset={8}>
            <DropdownMenuItem asChild>
              <Link href="/history" className="flex items-center cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                <span>Search History</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/pricing" className="flex items-center cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Pricing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/faq" className="flex items-center cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>FAQ</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about" className="flex items-center cursor-pointer">
                <Info className="mr-2 h-4 w-4" />
                <span>About</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };

    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 py-4 h-[72px] transition-colors duration-200',
          isDialogOpen
            ? 'bg-transparent pointer-events-none'
            : status === 'streaming' || status === 'ready'
            ? 'bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60'
            : 'bg-background',
          'animate-gradient-background'
        )}
      >
        {/* Left section - Ziq branding and buttons */}
        <div className={cn('flex items-center gap-3', isDialogOpen ? 'pointer-events-auto' : '')}>
          <div className="flex space-x-2 relative z-[70]">
            <Button
              type="button"
              variant={"default"}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm group transition-all hover:scale-105 pointer-events-auto flex items-center transition-all duration-300 shadow-sm"
              onClick={() => {
                // Clear any localStorage state that might be persisting search data
                localStorage.removeItem('lastQuery');
                localStorage.removeItem('lastMessages');
                localStorage.removeItem('searchState');
                
                // Use a client-side approach to reset the application state
                if (pathname === '/') {
                  // Create a custom event to notify the page to reset its state
                  const resetEvent = new CustomEvent('resetSearch', { detail: { timestamp: Date.now() } });
                  window.dispatchEvent(resetEvent);
                  
                  // Use router.refresh() to update the page without a full reload
                  router.refresh();
                } else {
                  // If we're on another page, navigate to home
                  router.push('/');
                }
              }}
            >
              <Plus size={18} className="group-hover:rotate-90 transition-all" />
              <span className="text-sm ml-2 md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto overflow-hidden transition-all duration-300 font-medium">
                New
              </span>
            </Button>
            
            <Button
              type="button"
              variant={"outline"}
              className="rounded-full bg-background hover:bg-muted/50 text-foreground backdrop-blur-sm group transition-all hover:scale-105 pointer-events-auto flex items-center transition-all duration-300 shadow-sm"
              onClick={() => router.push('/faq')}
            >
              <HelpCircle size={18} className="transition-all" />
              <span className="text-sm ml-2 opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300 font-medium">
                FAQ
              </span>
            </Button>
            
            <Button
              type="button"
              variant={"outline"}
              className="rounded-full bg-background hover:bg-muted/50 text-foreground backdrop-blur-sm group transition-all hover:scale-105 pointer-events-auto flex items-center transition-all duration-300 shadow-sm"
              onClick={() => {
                window.location.href = 'mailto:ziqsearch@gmail.com?subject=Feedback%20for%20Ziq';
              }}
            >
              <Mail size={18} className="transition-all" />
              <span className="text-sm ml-2 opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300 font-medium">
                Feedback
              </span>
            </Button>
          </div>
        </div>

        {/* Center section - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-lg items-center z-50 hidden">
        </div>

        {/* Right section - User profile, admin panel, etc. */}
        <div className={cn('flex items-center gap-2', isDialogOpen ? 'pointer-events-auto' : '')}>
          {/* Visibility indicator or toggle based on authentication and ownership */}
          {chatId && (
            <>
              {user && isOwner ? (
                /* Authenticated chat owners get toggle and share option */
                <>
                  {selectedVisibilityType === 'public' ? (
                    /* Public chat - show dropdown for copying link */
                    <DropdownMenu
                      open={dropdownOpen}
                      onOpenChange={!isChangingVisibility ? setDropdownOpen : undefined}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="pointer-events-auto bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          disabled={isChangingVisibility}
                        >
                          {isChangingVisibility ? (
                            <>
                              <ClassicLoader size="sm" className="text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Saving...</span>
                            </>
                          ) : (
                            <>
                              <GlobeHemisphereWest size={16} className="text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Shared</span>
                              <Copy size={14} className="ml-1 text-blue-600 dark:text-blue-400 opacity-70" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72 p-3">
                        <div className="space-y-3">
                          <header className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Share Link</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleVisibilityChange('private')}
                                disabled={isChangingVisibility}
                              >
                                <Lock size={12} className="mr-1" />
                                Make Private
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => setDropdownOpen(false)}
                                disabled={isChangingVisibility}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </Button>
                            </div>
                          </header>

                          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border border-border">
                            <div className="truncate flex-1 text-xs text-muted-foreground font-mono">{shareUrl}</div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              onClick={handleCopyLink}
                              title="Copy to clipboard"
                            >
                              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                          </div>

                          <footer className="flex flex-col space-y-2">
                            <div className="flex justify-center items-center">
                              <p className="text-xs text-muted-foreground">Anyone with this link can view this page</p>
                            </div>

                            <div className="flex justify-center gap-2 pt-1">
                              {typeof navigator !== 'undefined' && 'share' in navigator && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => {
                                    navigator
                                      .share({
                                        title: 'Shared Page',
                                        url: shareUrl,
                                      })
                                      .catch(console.error);
                                  }}
                                >
                                  <Share size={16} />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={handleShareLinkedIn}
                                title="Share on LinkedIn"
                              >
                                <LinkedinLogo size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={handleShareTwitter}
                                title="Share on X (Twitter)"
                              >
                                <XLogo size={16} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={handleShareReddit}
                                title="Share on Reddit"
                              >
                                <RedditLogo size={16} />
                              </Button>
                            </div>
                          </footer>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    /* Private chat - dropdown prompt to make public */
                    <DropdownMenu
                      open={privateDropdownOpen}
                      onOpenChange={!isChangingVisibility ? setPrivateDropdownOpen : undefined}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="pointer-events-auto bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                          disabled={isChangingVisibility}
                        >
                          {isChangingVisibility ? (
                            <>
                              <ClassicLoader size="sm" className="text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Saving...</span>
                            </>
                          ) : (
                            <>
                              <Share size={16} className="text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Share</span>
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-72 p-3">
                        <div className="space-y-3">
                          <header className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Share</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => setPrivateDropdownOpen(false)}
                              disabled={isChangingVisibility}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                          </header>

                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Share this page to make it accessible to anyone with the link.
                            </p>
                          </div>

                          <footer className="flex justify-end gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setPrivateDropdownOpen(false)}
                              disabled={isChangingVisibility}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleVisibilityChange('public')}
                              disabled={isChangingVisibility}
                            >
                              <Share size={12} className="mr-1" />
                              Share
                            </Button>
                          </footer>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : (
                /* Non-owners (authenticated or not) just see indicator */
                selectedVisibilityType === 'public' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="pointer-events-auto bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 opacity-80 cursor-not-allowed"
                        disabled
                      >
                        <GlobeHemisphereWest size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Shared</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      {user ? "This is someone else's shared page" : 'This is a shared page'}
                    </TooltipContent>
                  </Tooltip>
                )
              )}
            </>
          )}

          {/* Credits display */}
          {user && (
            <div className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-full text-sm flex items-center mr-2 border border-primary/20 dark:border-primary/30 transition-all hover:bg-primary/15 dark:hover:bg-primary/25">
              <Coins className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="font-medium text-primary">
                {isLoadingCredits ? '...' : userCredits !== null ? userCredits : '0'}
              </span>
            </div>
          )}

          {/* Subscription Status - show loading or actual status */}
          {user && (
            <>
              {isProStatusLoading ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-md pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border">
                      <div className="size-4 rounded-full bg-muted animate-pulse" />
                      <div className="w-8 h-3 bg-muted rounded animate-pulse hidden sm:block" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>
                    Loading subscription status...
                  </TooltipContent>
                </Tooltip>
              ) : subscriptionData ? (
                hasActiveSubscription ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-md pointer-events-auto flex items-center gap-1.5 p-1.5 bg-muted/50 border border-border">
                        <Crown size={14} className="text-foreground" />
                        <span className="text-xs font-medium text-foreground hidden sm:inline">Pro</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Pro Subscribed - Unlimited access
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="pointer-events-auto p-0 px-1"
                        onClick={() => router.push('/pricing')}
                      >
                        <Lightning size={16} />
                        <span className="text-sm font-medium hidden sm:inline ml-1">Upgrade</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      Upgrade to Pro for unlimited searches
                    </TooltipContent>
                  </Tooltip>
                )
              ) : null}
            </>
          )}

          {/* Chat History Button */}
          {onHistoryClick && <ChatHistoryButton onClick={onHistoryClick} />}
          
          {/* Admin Panel - only shown to authenticated users */}
          {user && (isAdmin || <AdminPanel />)}

          {/* User Profile */}
          {user ? (
            <UserProfile
              user={user}
              subscriptionData={subscriptionData}
              isProUser={isProUser}
              isProStatusLoading={isProStatusLoading}
            />
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-md hover:bg-primary/10 text-primary font-medium transition-all"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground ml-2 font-medium transition-all"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <AboutButton />
          <ThemeToggle />
        </div>

        <style jsx global>{`
          @keyframes gradient-animation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          .animate-gradient-background {
            /* Ziq light palette: blue -> teal gradient */
            background: linear-gradient(-45deg, #e6f0ff, #e6fbff, #f0f9ff, #e6f7ff);
            background-size: 400% 400%;
            animation: gradient-animation 15s ease infinite;
            animation-delay: 0.2s; /* slight delay to ensure initial render */
          }

          .dark .animate-gradient-background {
            /* Ziq dark palette: deep blue -> teal accents */
            background: linear-gradient(-45deg, #0b1220, #0a1b24, #0b1f2a, #0a1422);
            background-size: 400% 400%;
            animation: gradient-animation 15s ease infinite;
            animation-delay: 0.2s;
          }
        `}</style>
      </div>
    );
  },
);

Navbar.displayName = 'Navbar';

export { Navbar };
