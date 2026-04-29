'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Check, X, Trash2 } from 'lucide-react';

interface FeedbackItem {
  id: string;
  name: string | null;
  email: string | null;
  type: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

export function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      const response = await fetch('/api/admin/feedback');
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      // Update local state
      setFeedback(feedback.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      await fetch(`/api/admin/feedback?id=${id}`, {
        method: 'DELETE',
      });
      
      // Remove from local state
      setFeedback(feedback.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  }

  const testimonials = feedback.filter(f => f.type === 'testimonial');
  const newTestimonials = testimonials.filter(f => f.status === 'new');
  const approvedTestimonials = testimonials.filter(f => f.status === 'approved');
  const otherFeedback = feedback.filter(f => f.type !== 'testimonial');

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Feedback & Testimonials</h1>

      <Tabs defaultValue="new" className="w-full">
        <TabsList>
          <TabsTrigger value="new">
            New Testimonials ({newTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedTestimonials.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Other Feedback ({otherFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-6">
          {newTestimonials.length === 0 ? (
            <p className="text-muted-foreground">No new testimonials to review</p>
          ) : (
            newTestimonials.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name || 'Anonymous'}</CardTitle>
                      <CardDescription>{item.email}</CardDescription>
                      <CardDescription className="text-xs mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateStatus(item.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFeedback(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedTestimonials.length === 0 ? (
            <p className="text-muted-foreground">No approved testimonials yet</p>
          ) : (
            approvedTestimonials.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name || 'Anonymous'}</CardTitle>
                      <CardDescription>{item.email}</CardDescription>
                      <CardDescription className="text-xs mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, 'new')}
                      >
                        Unapprove
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFeedback(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 mt-6">
          {otherFeedback.length === 0 ? (
            <p className="text-muted-foreground">No other feedback</p>
          ) : (
            otherFeedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name || 'Anonymous'}</CardTitle>
                      <CardDescription>{item.email} • {item.type}</CardDescription>
                      <CardDescription className="text-xs mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFeedback(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">{item.subject}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
