import { db } from '@/lib/db';
import { feedback } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getApprovedTestimonials() {
  try {
    const testimonials = await db
      .select({
        id: feedback.id,
        name: feedback.name,
        message: feedback.message,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.type, 'testimonial'),
          eq(feedback.status, 'approved')
        )
      )
      .orderBy(desc(feedback.createdAt))
      .limit(50);

    return testimonials;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}
