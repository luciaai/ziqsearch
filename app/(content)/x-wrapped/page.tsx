'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XLogoIcon } from '@phosphor-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ColorPanels } from '@paper-design/shaders-react';
import Link from 'next/link';

export default function XWrappedPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(null);

  // Generate year options (current year and past 5 years)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  const quarters = [
    { value: 1, label: 'Q1', months: 'Jan-Mar' },
    { value: 2, label: 'Q2', months: 'Apr-Jun' },
    { value: 3, label: 'Q3', months: 'Jul-Sep' },
    { value: 4, label: 'Q4', months: 'Oct-Dec' },
  ];

  const handleGenerate = () => {
    const cleanUsername = username.trim().replace(/^@+/, '');

    if (!cleanUsername) {
      setError('Please enter a username');
      return;
    }

    setError('');
    setLoading(true);
    // Navigate to the username route with year and optional quarter parameter
    const params = new URLSearchParams({ year: selectedYear.toString() });
    if (selectedQuarter) {
      params.append('quarter', selectedQuarter.toString());
    }
    router.push(`/x-wrapped/${encodeURIComponent(cleanUsername)}?${params.toString()}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
      {/* Shader Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <ColorPanels
          style={{ width: '100%', height: '100%' }}
          colors={['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4']}
          colorBack="#00000000"
          density={1.6}
          angle1={0.3}
          angle2={0.3}
          length={1}
          edges
          blur={0.25}
          fadeIn={0.85}
          fadeOut={0.3}
          gradient={0}
          speed={0.6}
          rotation={112}
        />
        {/* Overlay to improve text readability */}
        <div className="absolute inset-0 bg-background/20" />
      </div>
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
        {/* Logo + Title */}
        <div className="space-y-4 text-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center justify-center gap-2">
              <XLogoIcon className="size-12" />
              <span className="font-be-vietnam-pro text-4xl tracking-tighter">Wrapped</span>
            </h1>
            <p className="mt-1 text-base text-foreground">Analyze any public X account with AI</p>
            <p className="text-sm text-muted-foreground">Perfect for research, education, and insights</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Enter any public X username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username"
                type="text"
                placeholder="nasa, stanford, elonmusk..."
                value={username}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, '');
                  setUsername(value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                disabled={loading}
                className="pl-8"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: @nasa, @stanford, @WHO, @OpenAI, or any researcher
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="year" className="text-sm font-medium">
              Select year to analyze
            </label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger id="year" disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year} {year === currentYear && '(Current year)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Time period (optional)
            </label>
            <div className="grid grid-cols-5 gap-2">
              <Button
                type="button"
                variant={selectedQuarter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedQuarter(null)}
                disabled={loading}
                className="text-xs"
              >
                Full Year
              </Button>
              {quarters.map((quarter) => (
                <Button
                  key={quarter.value}
                  type="button"
                  variant={selectedQuarter === quarter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedQuarter(quarter.value)}
                  disabled={loading}
                  className="flex flex-col items-center py-1 h-auto"
                >
                  <span className="text-xs font-semibold">{quarter.label}</span>
                  <span className="text-[10px] text-muted-foreground">{quarter.months}</span>
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleGenerate} disabled={loading || !username.trim()} className="w-full gap-2" size="lg">
            {loading ? (
              <>
                <Spinner className="size-4" />
                Redirecting…
              </>
            ) : (
              <>
                Analyze Account
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <p>
            AI analyzes posts, topics, engagement, and trends from the selected time period
          </p>
          <p>
            Analysis takes ~2 minutes · Public profiles only
            <br />
            Powered by{' '}
            <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              Grok
            </a>{' '}
            · Results cached for 5 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
}
