'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Upload, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { submitEducationDiscountRequest } from '@/app/actions';

export default function RequestEducationDiscountPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    details: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.role || !formData.details) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // Upload proof file if provided
      let proofUrl = '';
      if (proofFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', proofFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload proof document');
        }

        const uploadResult = await uploadResponse.json();
        proofUrl = uploadResult.url;
      }

      // Submit request
      const result = await submitEducationDiscountRequest({
        ...formData,
        proofUrl,
      });

      if (result.success) {
        toast.success('Request submitted successfully! We\'ll review it and get back to you within 2-3 business days.');
        router.push('/pricing');
      } else {
        toast.error(result.error || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and image files (JPG, PNG) are allowed');
        return;
      }

      setProofFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push('/pricing')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-tight font-be-vietnam-pro">
                Request Education Discount
              </h1>
              <p className="text-sm text-muted-foreground">
                Get 50% off Pro ($7/month instead of $14/month)
              </p>
            </div>
          </div>

          <div className="bg-muted/50 border border-border p-4 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Who qualifies:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Homeschool students and teachers</li>
              <li>• Students at institutions without .edu emails</li>
              <li>• International students</li>
              <li>• Educational researchers</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Note: If you have a .edu email, the discount is applied automatically - no need to request!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">
              We'll send the discount code to this email if approved
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Your Role <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role"
              type="text"
              placeholder="e.g., Homeschool student, Homeschool teacher, Student"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">
              School/Organization (Optional)
            </Label>
            <Input
              id="organization"
              type="text"
              placeholder="e.g., Classical Conversations, HSLDA, etc."
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">
              Additional Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="details"
              placeholder="Please tell us about your educational situation and why you're requesting this discount..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">
              Proof of Educational Status (Optional but recommended)
            </Label>
            <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
              <input
                id="proof"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="proof"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {proofFile ? proofFile.name : 'Click to upload proof'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or image (JPG, PNG) • Max 5MB
                  </p>
                </div>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Examples: Homeschool association membership, enrollment letter, curriculum receipt, student ID
            </p>
          </div>

          <div className="bg-muted/50 border border-border p-4 rounded-md">
            <p className="text-xs text-muted-foreground">
              By submitting this request, you confirm that you are actively involved in education as a student,
              teacher, or homeschool educator. We typically review requests within 2-3 business days.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/pricing')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
