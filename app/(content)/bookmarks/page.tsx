'use client';

import React, { useEffect, useState } from 'react';
import { getUserBookmarks } from '@/app/actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bookmark, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { removeBookmark } from '@/app/actions';
import { MarkdownRenderer } from '@/components/markdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BOOKMARK_LIMITS } from '@/lib/constants';

interface BookmarkWithDetails {
  id: string;
  messageId: string;
  chatId: string;
  note: string | null;
  createdAt: Date;
  message: {
    id: string;
    parts: any[];
    role: string;
  };
  chat: {
    id: string;
    title: string;
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const result = await getUserBookmarks();
      if ('bookmarks' in result) {
        setBookmarks(result.bookmarks as BookmarkWithDetails[]);
      } else {
        toast.error('Failed to load bookmarks');
      }
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (messageId: string, bookmarkId: string) => {
    setDeletingId(bookmarkId);
    try {
      await removeBookmark(messageId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    } finally {
      setDeletingId(null);
    }
  };

  const getMessageText = (message: any) => {
    const textPart = message.parts?.find((p: any) => p.type === 'text');
    return textPart?.text || 'No text content';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <Bookmark className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Bookmarks</h1>
            {!isLoading && (
              <span className="text-sm text-muted-foreground">
                ({bookmarks.length} of {BOOKMARK_LIMITS.FREE_LIMIT})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-9 md:ml-0">
            Your saved AI responses
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bookmarks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Bookmark important AI responses by clicking the bookmark icon on any assistant message
              </p>
              <Button asChild>
                <Link href="/">Start a search</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const messageText = getMessageText(bookmark.message);
              const preview = messageText.slice(0, 300) + (messageText.length > 300 ? '...' : '');

              return (
                <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/search/${bookmark.chatId}`}
                            className="text-sm font-medium text-primary hover:underline truncate"
                          >
                            {bookmark.chat.title}
                          </Link>
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bookmark.messageId, bookmark.id)}
                        disabled={deletingId === bookmark.id}
                        className="shrink-0"
                      >
                        {deletingId === bookmark.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={preview} />
                    </div>
                    {messageText.length > 300 && (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="mt-2 px-0"
                      >
                        <Link href={`/search/${bookmark.chatId}`}>
                          Read full response →
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
