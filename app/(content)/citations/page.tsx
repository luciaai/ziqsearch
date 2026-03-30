'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BookIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Citation {
  apa: string;
  mla: string;
  chicago: string;
  harvard: string;
}

export default function CitationsPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<Citation | null>(null);
  const [activeFormat, setActiveFormat] = useState('apa');

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate citations');
      }

      const data = await response.json();
      setCitations(data.citations);
      toast.success('Citations generated successfully');
    } catch (error) {
      toast.error('Failed to generate citations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${format.toUpperCase()} citation copied to clipboard`);
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeftIcon size={18} weight="regular" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center justify-center gap-2 relative">
              {/* Mobile sidebar trigger */}
              <div className="md:hidden absolute left-0">
                <SidebarTrigger />
              </div>
              <BookIcon size={32} weight="regular" />
              <h1 className="text-2xl font-semibold font-be-vietnam-pro">Citation Generator</h1>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Generate citations from URLs in multiple formats (APA, MLA, Chicago, Harvard)
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Source URL</CardTitle>
              <CardDescription>
                Paste a URL to automatically generate citations in multiple formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleGenerate();
                    }
                  }}
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Citations...
                  </>
                ) : (
                  'Generate Citations'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Citations Display */}
          {citations && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Citations</CardTitle>
                <CardDescription>Click to copy any citation format</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeFormat} onValueChange={setActiveFormat}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="apa">APA</TabsTrigger>
                    <TabsTrigger value="mla">MLA</TabsTrigger>
                    <TabsTrigger value="chicago">Chicago</TabsTrigger>
                    <TabsTrigger value="harvard">Harvard</TabsTrigger>
                  </TabsList>

                  <TabsContent value="apa" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={citations.apa}
                        readOnly
                        className="min-h-[100px] pr-12 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(citations.apa, 'APA')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="mla" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={citations.mla}
                        readOnly
                        className="min-h-[100px] pr-12 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(citations.mla, 'MLA')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="chicago" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={citations.chicago}
                        readOnly
                        className="min-h-[100px] pr-12 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(citations.chicago, 'Chicago')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="harvard" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={citations.harvard}
                        readOnly
                        className="min-h-[100px] pr-12 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(citations.harvard, 'Harvard')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Paste the URL of the article, webpage, or source you want to cite</p>
              <p>2. Click "Generate Citations" to automatically create citations</p>
              <p>3. Switch between citation formats using the tabs</p>
              <p>4. Click the copy button to copy the citation to your clipboard</p>
              <p className="pt-2 text-xs">
                <strong>Note:</strong> Always verify citations for accuracy. AI-generated citations may need
                manual adjustments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
