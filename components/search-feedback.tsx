'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, X, Send } from 'lucide-react';
import { XLogoIcon } from '@phosphor-icons/react';

interface SearchFeedbackProps {
  chatId?: string;
  messageCount?: number;
}

export function SearchFeedback({ chatId, messageCount = 0 }: SearchFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | 'testimonial' | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [allowPublic, setAllowPublic] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Count assistant messages (every 2 messages = 1 user + 1 assistant)
  const assistantMessageCount = Math.floor(messageCount / 2);
  
  // Exponential backoff: show at responses 1, 3, 7, 15, 31...
  // Formula: 2^n - 1 (where n = 1, 2, 3, 4...)
  const feedbackPoints = [1, 3, 7, 15, 31, 63, 127];
  const shouldShow = feedbackPoints.includes(assistantMessageCount);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    if (type === 'helpful') {
      setShowSharePrompt(true);
    } else {
      setShowFeedbackForm(true);
    }
  };

  const handleShare = () => {
    const tweetText = encodeURIComponent(
      "Just used @ziqsearch for research. Got cited sources from 75 AI models in seconds. Impressed by the honesty - no fake stats, just real features. https://ziqsearch.com"
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    setDismissed(true);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    // For testimonials, require them to make a choice
    if (feedback === 'testimonial' && allowPublic === null) {
      alert('Please let us know if we can feature your feedback publicly.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If testimonial but no permission, save as 'helpful' feedback instead
      // This way you still get it, but it won't show on testimonials page
      const actualType = feedback === 'testimonial' && !allowPublic ? 'helpful' : feedback;
      
      // Send feedback to your email via API
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          chatId,
          type: actualType,
          allowPublic,
        }),
      });
      
      setSubmitted(true);
      setTimeout(() => setDismissed(true), 2000);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't show if dismissed or not the right message count
  if (dismissed || !shouldShow) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-4">
      {!showSharePrompt && !showFeedbackForm ? (
        <div className="flex items-center justify-center gap-4 py-3 px-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Was this helpful?</span>
          <button
            onClick={() => handleFeedback('helpful')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            aria-label="Helpful"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleFeedback('not-helpful')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            aria-label="Not helpful"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      ) : showFeedbackForm ? (
        <div className="relative py-4 px-6 bg-muted/30 border border-border rounded-lg">
          {submitted ? (
            <div className="flex items-center gap-3 py-2">
              <span className="text-2xl">🙏</span>
              <p className="text-sm font-medium text-foreground">Thanks for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">
                  {feedback === 'testimonial' 
                    ? 'Share your experience' 
                    : feedback === 'not-helpful' 
                    ? 'How can we improve?' 
                    : 'Tell us more'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feedback === 'testimonial' 
                    ? 'Your feedback goes to the team. Check the box below if you want it featured publicly.' 
                    : 'Your feedback goes directly to the team.'}
                </p>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  feedback === 'testimonial'
                    ? 'What did you like about Ziq? How did it help you?'
                    : 'What would make Ziq better for you?'
                }
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
                rows={3}
              />
              {feedback === 'testimonial' && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md border border-border">
                  <p className="text-xs font-medium text-foreground mb-2">
                    Are you willing to let us feature your review on our website?
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="allowPublic"
                        checked={allowPublic === true}
                        onChange={() => setAllowPublic(true)}
                        className="cursor-pointer"
                      />
                      <span className="text-foreground">Yes, I'm willing</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="allowPublic"
                        checked={allowPublic === false}
                        onChange={() => setAllowPublic(false)}
                        className="cursor-pointer"
                      />
                      <span className="text-foreground">No, keep it private</span>
                    </label>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendFeedback}
                  disabled={!feedbackText.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative py-4 px-6 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">😊</span>
            <div>
              <p className="text-sm font-medium text-foreground">Glad it helped!</p>
              <p className="text-xs text-muted-foreground">Help others discover Ziq by sharing your experience</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowSharePrompt(false);
                setShowFeedbackForm(true);
                setFeedback('testimonial');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors"
            >
              Share Feedback/Review
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border hover:bg-muted/50 rounded-md transition-colors"
            >
              <XLogoIcon className="w-4 h-4" weight="fill" />
              Tweet
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
