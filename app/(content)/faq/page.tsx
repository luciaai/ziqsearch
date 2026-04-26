'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SciraLogo } from '@/components/logos/scira-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useRouter } from 'next/navigation';
import {
  ProAccordion,
  ProAccordionItem,
  ProAccordionTrigger,
  ProAccordionContent,
} from '@/components/ui/pro-accordion';
import { 
  Search, 
  GraduationCap, 
  Zap, 
  BookOpen, 
  Eye, 
  Code, 
  Youtube, 
  MessageSquare,
  Sparkles,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function FAQPage() {
  const router = useRouter();
  const [openItem, setOpenItem] = useState<string>('');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between h-14 px-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <SciraLogo className="size-6 transition-transform duration-300 group-hover:scale-110" />
            </Link>

            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-4 text-sm rounded-none"
                onClick={() => router.push('/')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-blue-50/30 to-background dark:from-blue-950/10 dark:to-background">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-muted-foreground tracking-wide">Help Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight text-foreground font-be-vietnam-pro mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Learn how to use Ziq effectively for research, studying, and discovery.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Getting Started */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Getting Started</h2>
            </div>
            
            <ProAccordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              <ProAccordionItem value="what-is-ziq">
                <ProAccordionTrigger>What is Ziq?</ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Ziq is an AI-powered research platform designed for students, researchers, and curious minds. 
                    It combines advanced search capabilities with conversational AI to help you find information, 
                    understand complex topics, and organize your research efficiently.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Unlike traditional search engines, Ziq provides cited sources, generates citations, and offers 
                    specialized search modes for different types of research.
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="how-to-start">
                <ProAccordionTrigger>How do I get started?</ProAccordionTrigger>
                <ProAccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
                    <li>Type your question or topic in the search bar</li>
                    <li>Select a search mode (Web, Academic, Chat, etc.) based on your needs</li>
                    <li>Press Enter or click Search</li>
                    <li>Review the AI-generated response with cited sources</li>
                    <li>Ask follow-up questions to dive deeper</li>
                  </ol>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    No account required to start searching! Create an account to save your search history and access Pro features.
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="free-vs-pro">
                <ProAccordionTrigger>What's the difference between Free and Pro?</ProAccordionTrigger>
                <ProAccordionContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-foreground mb-2">Free Plan:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>7 searches per day (210/month)</li>
                        <li>Access to basic search modes</li>
                        <li>Search history</li>
                        <li>Citation generator</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">Pro Plan ($14/month or $99/year):</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>500 searches per month</li>
                        <li>Advanced multi-source research (Extreme mode)</li>
                        <li>Lookout - automated recurring searches</li>
                        <li>Priority support</li>
                        <li>Access to premium AI models</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">Student Plan ($7/month or $59/year):</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>500 searches per month (same as Pro)</li>
                        <li>All Pro features</li>
                        <li>Requires .edu email or manual verification</li>
                        <li>Available for homeschool students too</li>
                      </ul>
                    </div>
                  </div>
                </ProAccordionContent>
              </ProAccordionItem>
            </ProAccordion>
          </div>

          {/* Search Modes */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Search Modes</h2>
            </div>
            
            <ProAccordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              <ProAccordionItem value="web-search">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Web Search</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Search the entire internet for current information, news, articles, and general knowledge.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Current events, general research, fact-checking, finding recent articles
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="academic-search">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Academic Search</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Search research papers, academic journals, and PDFs. Perfect for scholarly research and citations.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Research papers, literature reviews, academic citations, scientific studies
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="chat-mode">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat Mode</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Have a conversation with AI without web search. Great for understanding concepts, brainstorming, 
                    or getting explanations based on the AI's training data.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Explaining concepts, tutoring, brainstorming, general questions, math help
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="code-search">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>Code Search</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Get programming help, documentation, code examples, and technical explanations.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Programming questions, debugging, learning new frameworks, code examples
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="youtube-search">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    <span>YouTube Search</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Search YouTube videos and their transcripts. Find educational content, tutorials, and lectures.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Video tutorials, lectures, educational content, how-to guides
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="extreme-mode">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Extreme Mode (Pro)</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Advanced multi-source research that combines multiple search strategies and analyzes results 
                    from various sources for comprehensive answers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Deep research, complex topics, comprehensive analysis, thesis research
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>
            </ProAccordion>
          </div>

          {/* Features */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Features</h2>
            </div>
            
            <ProAccordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              <ProAccordionItem value="citations">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Citation Generator</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Generate properly formatted citations from any URL in APA, MLA, Chicago, and Harvard styles.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>How to use:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Go to Research Tools → Citations in the sidebar</li>
                    <li>Paste the URL of your source</li>
                    <li>Click Generate Citation</li>
                    <li>Copy the citation in your preferred format</li>
                  </ol>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="lookout">
                <ProAccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Lookout (Pro)</span>
                  </div>
                </ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Schedule automated searches to monitor topics and get updates when new information becomes available.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>How to use:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Go to Research Tools → Lookout in the sidebar</li>
                    <li>Create a new Lookout with your search query</li>
                    <li>Set the frequency (daily, weekly, etc.)</li>
                    <li>Receive updates when new relevant information is found</li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-3">
                    <strong>Best for:</strong> Tracking research topics, monitoring news, staying updated on specific subjects
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="search-history">
                <ProAccordionTrigger>Search History & Library</ProAccordionTrigger>
                <ProAccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    All your searches are automatically saved so you can revisit previous research sessions.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Access your search library from the sidebar to find past searches, continue conversations, 
                    or reference previous research.
                  </p>
                </ProAccordionContent>
              </ProAccordionItem>
            </ProAccordion>
          </div>

          {/* Tips for Students */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Tips for Students & Researchers</h2>
            </div>
            
            <ProAccordion type="single" collapsible value={openItem} onValueChange={setOpenItem}>
              <ProAccordionItem value="research-workflow">
                <ProAccordionTrigger>What's the best research workflow?</ProAccordionTrigger>
                <ProAccordionContent>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
                    <li>
                      <strong className="text-foreground">Start broad:</strong> Use Web or Academic search to understand your topic
                    </li>
                    <li>
                      <strong className="text-foreground">Ask questions:</strong> Switch to Chat mode to clarify concepts you don't understand
                    </li>
                    <li>
                      <strong className="text-foreground">Find sources:</strong> Use Academic search to find research papers and credible sources
                    </li>
                    <li>
                      <strong className="text-foreground">Generate citations:</strong> Use the Citation Generator for your bibliography
                    </li>
                    <li>
                      <strong className="text-foreground">Stay updated:</strong> Set up a Lookout to monitor new research on your topic (Pro)
                    </li>
                  </ol>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="better-results">
                <ProAccordionTrigger>How do I get better search results?</ProAccordionTrigger>
                <ProAccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                    <li>
                      <strong className="text-foreground">Be specific:</strong> Instead of "climate change," try "impact of climate change on coral reefs"
                    </li>
                    <li>
                      <strong className="text-foreground">Use the right mode:</strong> Academic for papers, Web for current info, Chat for explanations
                    </li>
                    <li>
                      <strong className="text-foreground">Ask follow-ups:</strong> Refine your search by asking clarifying questions
                    </li>
                    <li>
                      <strong className="text-foreground">Check sources:</strong> Always review the cited sources for credibility
                    </li>
                  </ul>
                </ProAccordionContent>
              </ProAccordionItem>

              <ProAccordionItem value="study-tips">
                <ProAccordionTrigger>How can Ziq help me study?</ProAccordionTrigger>
                <ProAccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                    <li>Use Chat mode to explain difficult concepts in simpler terms</li>
                    <li>Ask for examples and practice problems</li>
                    <li>Get summaries of complex topics</li>
                    <li>Find YouTube tutorials on specific subjects</li>
                    <li>Generate study guides by asking for key points on a topic</li>
                    <li>Use Academic search to find supplementary reading materials</li>
                  </ul>
                </ProAccordionContent>
              </ProAccordionItem>
            </ProAccordion>
          </div>

          {/* Coming Soon */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Coming Soon</h2>
            </div>
            
            <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900 p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                We're constantly improving Ziq. Here's what's coming next:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-foreground">Tags & Organization:</strong> Tag and organize your searches by project or class</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-foreground">Bookmarks:</strong> Save important search results and sources for later</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-foreground">Notes:</strong> Add personal notes to your searches and sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-foreground">Export:</strong> Export your research and citations to PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong className="text-foreground">Collaboration:</strong> Share searches and research with classmates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Powered By */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-light tracking-tight font-be-vietnam-pro">Technology & Attribution</h2>
            </div>
            
            <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900 p-6 rounded-lg space-y-4">
              <p className="text-sm text-muted-foreground">
                Ziq is built with cutting-edge technology and powered by industry-leading services:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Search & Retrieval</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Exa:</strong> Web search</li>
                    <li>• <strong>Firecrawl:</strong> Academic papers & PDFs</li>
                    <li>• <strong>Parallel AI:</strong> Reddit search</li>
                    <li>• <strong>Tavily:</strong> Alternative web search</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">AI Models</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• OpenAI (GPT-4, GPT-4o)</li>
                    <li>• Anthropic (Claude)</li>
                    <li>• Google (Gemini)</li>
                    <li>• DeepSeek, Qwen, and more</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Data & APIs</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>CoinGecko:</strong> Cryptocurrency data</li>
                    <li>• <strong>YouTube API:</strong> Video transcripts</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Infrastructure</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Next.js & React</li>
                    <li>• Vercel hosting</li>
                    <li>• Open source (AGPL-3.0)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Still Have Questions */}
          <div className="border-t border-border pt-12">
            <div className="text-center">
              <h3 className="text-xl font-light tracking-tight font-be-vietnam-pro mb-3">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Check out our About page or start searching to explore Ziq's features.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/about')}
                >
                  About Ziq
                </Button>
                <Button
                  onClick={() => router.push('/')}
                >
                  Start Searching
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Ziq. Open source under AGPL-3.0.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
