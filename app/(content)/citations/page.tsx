'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type SourceType = 'book' | 'journal' | 'website' | 'other';

interface ManualCitationData {
  sourceType: SourceType;
  author: string;
  title: string;
  publisher: string;
  year: string;
  city: string;
  edition: string;
  pages: string;
  doi: string;
  url: string;
  journalTitle: string;
  volume: string;
  issue: string;
  websiteTitle: string;
  accessDate: string;
}

export default function CitationsPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<Citation | null>(null);
  const [activeFormat, setActiveFormat] = useState('apa');
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [manualData, setManualData] = useState<ManualCitationData>({
    sourceType: 'book',
    author: '',
    title: '',
    publisher: '',
    year: '',
    city: '',
    edition: '',
    pages: '',
    doi: '',
    url: '',
    journalTitle: '',
    volume: '',
    issue: '',
    websiteTitle: '',
    accessDate: '',
  });

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

  const handleManualGenerate = () => {
    const { author, title, year } = manualData;
    if (!author.trim() || !title.trim()) {
      toast.error('Please fill in at least Author and Title');
      return;
    }

    const generatedCitations = {
      apa: generateAPA(manualData),
      mla: generateMLA(manualData),
      chicago: generateChicago(manualData),
      harvard: generateHarvard(manualData),
    };

    setCitations(generatedCitations);
    toast.success('Citations generated successfully');
  };

  const generateAPA = (data: ManualCitationData): string => {
    const { sourceType, author, year, title, city, publisher, edition, pages, doi, url: bookUrl, journalTitle, volume, issue, websiteTitle, accessDate } = data;
    let citation = `${author}`;
    if (year) citation += ` (${year})`;
    else citation += ` (n.d.)`;
    citation += '. ';
    
    if (sourceType === 'journal') {
      // APA Journal: Author. (Year). Title. Journal Name, volume(issue), pages. doi.org
      citation += `${title}. <em>${journalTitle}</em>`;
      if (volume) {
        citation += `, ${volume}`;
        if (issue) citation += `(${issue})`;
      }
      if (pages) {
        // Use en dash for page ranges
        const pageRange = pages.replace(/-/g, '–');
        citation += `, ${pageRange}`;
      }
      if (doi) citation += `. ${doi}`;
      else if (bookUrl) citation += `. ${bookUrl}`;
    } else if (sourceType === 'website') {
      // APA Website: Author. (Year). Title. url
      citation += `<em>${title}</em>. `;
      if (bookUrl) {
        const cleanUrl = bookUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
        citation += `${cleanUrl}`;
      }
    } else {
      // APA Book: Author. (Year). Title (Edition). Publisher.
      citation += `<em>${title}</em>`;
      if (edition) citation += ` (${edition} ed.)`;
      citation += '. ';
      if (publisher) citation += `${publisher}`;
      citation += '.';
    }
    return citation;
  };

  const generateMLA = (data: ManualCitationData): string => {
    const { sourceType, author, title, publisher, year, city, edition, pages, doi, url: bookUrl, journalTitle, volume, issue, websiteTitle, accessDate } = data;
    let citation = `${author}. `;
    
    if (sourceType === 'journal') {
      // MLA Journal: Author. "Title." Journal, vol. #, no. #, Year, pp. #-#. DOI: xxx.
      citation += `"${title}." <em>${journalTitle}</em>`;
      if (volume) citation += `, vol. ${volume}`;
      if (issue) citation += `, no. ${issue}`;
      if (year) citation += `, ${year}`;
      if (pages) citation += `, pp. ${pages}`;
      if (doi) citation += `. DOI: ${doi}`;
      citation += '.';
    } else if (sourceType === 'website') {
      // MLA Website: "Title." Site Name, Year, url.
      citation += `"${title}." `;
      if (websiteTitle) citation += `<em>${websiteTitle}</em>, `;
      if (year) citation += `${year}, `;
      if (bookUrl) {
        const cleanUrl = bookUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
        citation += `${cleanUrl}`;
      }
      citation += '.';
    } else {
      // MLA Book: Author. Title. Edition, Publisher, Year.
      citation += `<em>${title}</em>. `;
      if (edition) citation += `${edition} ed., `;
      if (publisher) citation += `${publisher}, `;
      if (year) citation += `${year}`;
      citation += '.';
    }
    return citation;
  };

  const generateChicago = (data: ManualCitationData): string => {
    const { sourceType, author, year, title, city, publisher, edition, pages, doi, journalTitle, volume, issue, websiteTitle, accessDate, url: bookUrl } = data;
    let citation = `${author}. `;
    
    if (sourceType === 'journal') {
      // Chicago Journal: Author. "Title." Journal vol, no. # (Year): pages. doi.org.
      citation += `"${title}." <em>${journalTitle}</em>`;
      if (volume) citation += ` ${volume}`;
      if (issue) citation += `, no. ${issue}`;
      if (year) citation += ` (${year})`;
      if (pages) citation += `: ${pages}`;
      if (doi) citation += `. ${doi}`;
      citation += '.';
    } else if (sourceType === 'website') {
      // Chicago Website: "Title." Site Name, Year. Accessed Month Day, Year. url.
      citation += `"${title}." `;
      if (websiteTitle) citation += `<em>${websiteTitle}</em>, `;
      if (year) citation += `${year}. `;
      if (accessDate) citation += `Accessed ${accessDate}. `;
      if (bookUrl) {
        const cleanUrl = bookUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
        citation += `${cleanUrl}`;
      }
      citation += '.';
    } else {
      // Chicago Book: Author. Title. Edition. City: Publisher, Year.
      citation += `<em>${title}</em>. `;
      if (edition) citation += `${edition} ed. `;
      if (city && publisher && year) citation += `${city}: ${publisher}, ${year}`;
      else if (publisher && year) citation += `${publisher}, ${year}`;
      citation += '.';
    }
    return citation;
  };

  const generateHarvard = (data: ManualCitationData): string => {
    const { sourceType, author, year, title, city, publisher, edition, pages, journalTitle, volume, issue, websiteTitle, accessDate, url: bookUrl, doi } = data;
    let citation = `${author}`;
    if (year) citation += ` (${year})`;
    else citation += ` (n.d.)`;
    citation += ' ';
    
    if (sourceType === 'journal') {
      // Harvard Journal: Author (Year) 'Title', Journal, vol(issue), pp. pages. DOI: xxx.
      citation += `'${title}', <em>${journalTitle}</em>`;
      if (volume) {
        citation += `, ${volume}`;
        if (issue) citation += `(${issue})`;
      }
      if (pages) citation += `, pp. ${pages}`;
      if (doi) citation += `. DOI: ${doi}`;
      citation += '.';
    } else if (sourceType === 'website') {
      // Harvard Website: Author (Year) 'Title'. Available at: url (Accessed: Day Month Year).
      citation += `'${title}'`;
      if (bookUrl) {
        const cleanUrl = bookUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
        citation += `. Available at: ${cleanUrl}`;
      }
      if (accessDate) citation += ` (Accessed: ${accessDate})`;
      citation += '.';
    } else {
      // Harvard Book: Author (Year) Title. Edition. City: Publisher.
      citation += `<em>${title}</em>. `;
      if (edition) citation += `${edition} edn. `;
      if (city && publisher) citation += `${city}: ${publisher}`;
      else if (publisher) citation += `${publisher}`;
      citation += '.';
    }
    return citation;
  };

  const handleCopy = async (text: string, format: string) => {
    try {
      // The text already contains <em> tags, so we just need to wrap it in HTML
      // Strip <em> tags for plain text version
      const plainText = text.replace(/<\/?em>/g, '');
      const htmlText = `<p>${text}</p>`;

      // Use the modern clipboard API with both formats
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' }),
        }),
      ]);
      
      toast.success(`${format.toUpperCase()} citation copied with formatting`);
    } catch (err) {
      // Fallback to plain text if rich text copy fails
      const plainText = text.replace(/<\/?em>/g, '');
      navigator.clipboard.writeText(plainText);
      toast.success(`${format.toUpperCase()} citation copied`);
    }
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
              <CardTitle>Generate Citation</CardTitle>
              <CardDescription>
                Choose between URL or manual entry for books and other sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'url' | 'manual')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">From URL</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4 mt-4">
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
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="sourceType">Source Type</Label>
                    <Select
                      value={manualData.sourceType}
                      onValueChange={(value) => setManualData({ ...manualData, sourceType: value as SourceType })}
                    >
                      <SelectTrigger id="sourceType">
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="journal">Journal Article</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author(s) *</Label>
                      <Input
                        id="author"
                        placeholder="Last, F. M."
                        value={manualData.author}
                        onChange={(e) => setManualData({ ...manualData, author: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        placeholder="2024"
                        value={manualData.year}
                        onChange={(e) => setManualData({ ...manualData, year: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Book or Article Title"
                        value={manualData.title}
                        onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input
                        id="publisher"
                        placeholder="Publisher Name"
                        value={manualData.publisher}
                        onChange={(e) => setManualData({ ...manualData, publisher: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={manualData.city}
                        onChange={(e) => setManualData({ ...manualData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edition">Edition</Label>
                      <Input
                        id="edition"
                        placeholder="2nd"
                        value={manualData.edition}
                        onChange={(e) => setManualData({ ...manualData, edition: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pages">Pages</Label>
                      <Input
                        id="pages"
                        placeholder="123-145"
                        value={manualData.pages}
                        onChange={(e) => setManualData({ ...manualData, pages: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doi">DOI (optional)</Label>
                      <Input
                        id="doi"
                        placeholder="10.1234/example"
                        value={manualData.doi}
                        onChange={(e) => setManualData({ ...manualData, doi: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookUrl">URL (optional)</Label>
                      <Input
                        id="bookUrl"
                        placeholder="https://..."
                        value={manualData.url}
                        onChange={(e) => setManualData({ ...manualData, url: e.target.value })}
                      />
                    </div>

                    {/* Journal-specific fields */}
                    {manualData.sourceType === 'journal' && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="journalTitle">Journal Title *</Label>
                          <Input
                            id="journalTitle"
                            placeholder="Journal of Example Studies"
                            value={manualData.journalTitle}
                            onChange={(e) => setManualData({ ...manualData, journalTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="volume">Volume</Label>
                          <Input
                            id="volume"
                            placeholder="12"
                            value={manualData.volume}
                            onChange={(e) => setManualData({ ...manualData, volume: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issue">Issue</Label>
                          <Input
                            id="issue"
                            placeholder="3"
                            value={manualData.issue}
                            onChange={(e) => setManualData({ ...manualData, issue: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Website-specific fields */}
                    {manualData.sourceType === 'website' && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="websiteTitle">Website Name</Label>
                          <Input
                            id="websiteTitle"
                            placeholder="Example Website"
                            value={manualData.websiteTitle}
                            onChange={(e) => setManualData({ ...manualData, websiteTitle: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accessDate">Access Date</Label>
                          <Input
                            id="accessDate"
                            placeholder="January 15, 2024"
                            value={manualData.accessDate}
                            onChange={(e) => setManualData({ ...manualData, accessDate: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <Button onClick={handleManualGenerate} className="w-full">
                    Generate Citations
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Citations Display */}
          {citations && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Citations</CardTitle>
                <CardDescription>
                  Click to copy with formatting. Italics will be preserved when pasting into Word, Google Docs, etc.
                </CardDescription>
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
                        value={citations.apa.replace(/<\/?em>/g, '')}
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
                        value={citations.mla.replace(/<\/?em>/g, '')}
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
                        value={citations.chicago.replace(/<\/?em>/g, '')}
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
                        value={citations.harvard.replace(/<\/?em>/g, '')}
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
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">From URL:</p>
                <p>1. Select the "From URL" tab</p>
                <p>2. Paste the URL of the article or webpage you want to cite</p>
                <p>3. Click "Generate Citations" to automatically create citations</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Manual Entry:</p>
                <p>1. Select the "Manual Entry" tab</p>
                <p>2. Choose your source type (Book, Journal Article, Website, or Other)</p>
                <p>3. Fill in the required fields (Author and Title are required)</p>
                <p>4. Add optional details like publisher, year, pages, DOI, etc.</p>
                <p>5. Click "Generate Citations" to create properly formatted citations</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Viewing & Copying:</p>
                <p>• Switch between citation formats (APA, MLA, Chicago, Harvard) using the tabs</p>
                <p>• Click the copy button to copy the citation with proper formatting</p>
                <p>• <strong>Italics are automatically applied when you paste!</strong></p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-semibold text-foreground mb-2 text-sm">📋 The titles will be italicized on paste!</p>
                <p className="text-xs mb-1">• <strong>Books:</strong> Book title will appear in italics</p>
                <p className="text-xs mb-1">• <strong>Journal Articles:</strong> Journal name will appear in italics (article title stays in quotes)</p>
                <p className="text-xs mb-1">• <strong>Websites:</strong> Website name will appear in italics</p>
                <p className="text-xs mt-2 font-medium text-foreground">When you paste into Word or Google Docs, the formatting is automatic - no manual italicizing needed!</p>
              </div>
              <p className="pt-2 text-xs">
                <strong>Note:</strong> Always verify citations for accuracy. Generated citations may need
                manual adjustments to meet specific style guide requirements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
