'use client';

import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useState, useEffect } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { SciraLogo } from '@/components/logos/scira-logo';

const testimonials = [
  {
    content:
      "Perfect for research projects! I used it to gather information for my history paper and it found sources I never would have discovered on my own. The citations made writing my bibliography so much easier.",
    author: 'Student Researcher',
    handle: '@researcher',
    link: '#',
  },
  {
    content: 'As a homeschool parent, this tool has been invaluable for creating lesson plans and finding educational resources. It saves me hours of research time every week.',
    author: 'Homeschool Educator',
    handle: '@educator',
    link: '#',
  },
  {
    content:
      "The AI-powered search helped me understand complex scientific concepts for my thesis. It breaks down information in a way that's easy to comprehend and provides multiple perspectives.",
    author: 'Graduate Student',
    handle: '@gradstudent',
    link: '#',
  },
  {
    content:
      'Game changer for my research work. I can quickly find relevant academic papers, compare different viewpoints, and get comprehensive answers to my questions all in one place.',
    author: 'Independent Researcher',
    handle: '@researcher',
    link: '#',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="flex min-h-svh w-full bg-background">
      {/* Left Panel - Minimal Brand */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col bg-background">
        {/* Centered Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 xl:px-20">
          {/* Logo and Title */}
          <div className="w-full max-w-md">
            <Link href="/" className="inline-flex items-center mb-16 group">
              <SciraLogo className="h-16 w-auto transition-transform duration-300 group-hover:scale-110" />
            </Link>

            {/* Tagline */}
            <div className="mb-16">
              <p className="text-2xl xl:text-3xl font-light tracking-tight leading-snug text-foreground/90">
                Think it. Find it.
                <br />
                Cite it.
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative">
              <Carousel
                className="w-full"
                opts={{ loop: true }}
                setApi={setApi}
                plugins={[
                  Autoplay({
                    delay: 6000,
                    stopOnInteraction: true,
                    stopOnMouseEnter: true,
                  }),
                ]}
              >
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index}>
                      <Link
                        href={testimonial.link}
                        target="_blank"
                        className="block group/testimonial"
                      >
                        <div className="pr-4">
                          <blockquote className="text-sm leading-relaxed text-muted-foreground group-hover/testimonial:text-foreground/80 transition-colors mb-4">
                            "{testimonial.content}"
                          </blockquote>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {testimonial.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {testimonial.handle}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Minimal Indicators */}
              <div className="flex items-center gap-1.5 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-px transition-all duration-500 ${index === current
                        ? 'w-8 bg-foreground'
                        : 'w-4 bg-foreground/20 hover:bg-foreground/40'
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats & Links */}
        <div className="px-12 xl:px-20 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8 text-xs text-muted-foreground">
              <span>5M+ searches</span>
              <span className="w-px h-3 bg-border" />
              <span>100K+ users</span>
              <span className="w-px h-3 bg-border" />
              <span>Students & Researchers</span>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 lg:w-[55%] xl:w-[50%] flex flex-col bg-background lg:border-l lg:border-border">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-center h-16 border-b border-border">
          <Link href="/" className="flex items-center">
            <SciraLogo className="h-8 w-auto" />
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          {children}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center h-12 text-xs text-muted-foreground">
          <span>Trusted by researchers worldwide</span>
        </footer>
      </div>
    </div>
  );
}
