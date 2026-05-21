'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { getUserMessageCount } from '@/app/actions';
import { SEARCH_LIMITS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

interface SearchQuotaProps {
  className?: string;
  refreshKey?: number;
}

export function SearchQuota({ className, refreshKey }: SearchQuotaProps) {
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuota();
  }, [refreshKey]);

  const loadQuota = async () => {
    try {
      const result = await getUserMessageCount();
      if ('count' in result) {
        setMessageCount(result.count);
      }
    } catch (error) {
      console.error('Failed to load quota:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Loading quota...
      </Badge>
    );
  }

  if (messageCount === null) {
    return null;
  }

  const remaining = SEARCH_LIMITS.DAILY_SEARCH_LIMIT - messageCount;
  const isLow = remaining <= 2;
  const isExceeded = remaining <= 0;

  return (
    <Badge 
      variant={isExceeded ? "destructive" : isLow ? "outline" : "secondary"}
      className={className}
    >
      {isExceeded ? (
        <>
          Daily limit reached ({SEARCH_LIMITS.DAILY_SEARCH_LIMIT}/{SEARCH_LIMITS.DAILY_SEARCH_LIMIT})
        </>
      ) : (
        <>
          {remaining} of {SEARCH_LIMITS.DAILY_SEARCH_LIMIT} free searches remaining today
        </>
      )}
    </Badge>
  );
}
