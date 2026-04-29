import { getApprovedTestimonials } from '@/lib/db/testimonials';
import { SciraLogo } from '@/components/logos/scira-logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Quote } from 'lucide-react';

export const metadata = {
  title: 'Testimonials | Ziq',
  description: 'See what users are saying about Ziq - honest reviews from real researchers.',
};

export default async function TestimonialsPage() {
  const testimonials = await getApprovedTestimonials();

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
                asChild
              >
                <Link href="/">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-purple-50/20 via-blue-50/10 to-background dark:from-purple-950/10 dark:via-blue-950/5 dark:to-background">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <Quote className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-muted-foreground tracking-wide">User Reviews</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight text-foreground font-be-vietnam-pro mb-4">
            What Users Are Saying
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Honest reviews from real researchers using Ziq. No fake testimonials, just genuine feedback.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {testimonials.length === 0 ? (
            <div className="text-center py-20">
              <Quote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial: any) => (
                <div
                  key={testimonial.id}
                  className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <Quote className="h-6 w-6 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-foreground leading-relaxed mb-4">
                    "{testimonial.message}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">
                      {testimonial.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-light tracking-tight mb-4">Try Ziq yourself</h2>
          <p className="text-muted-foreground mb-8">
            Experience fast research with real sources and 75 AI models.
          </p>
          <Button size="lg" className="rounded-none" asChild>
            <Link href="/">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
