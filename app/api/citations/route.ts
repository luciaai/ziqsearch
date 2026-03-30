import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage content
    let pageContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CitationBot/1.0)',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL');
      }
      
      const html = await response.text();
      
      // Extract basic metadata from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      pageContent = html.substring(0, 5000); // Limit content size
    } catch (error) {
      console.error('Error fetching URL:', error);
      return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 400 });
    }

    // Use AI to extract metadata and generate citations
    const prompt = `You are a citation generator. Analyze the following webpage content and URL to extract metadata and generate accurate citations.

URL: ${url}

Webpage content (first 5000 characters):
${pageContent}

Extract the following information:
- Title
- Author(s)
- Publication date
- Publisher/Website name
- Access date (use today's date)

Then generate citations in these formats:
1. APA (7th edition)
2. MLA (9th edition)
3. Chicago (17th edition, Notes and Bibliography)
4. Harvard

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "apa": "citation text here",
  "mla": "citation text here",
  "chicago": "citation text here",
  "harvard": "citation text here"
}`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.3,
    });

    // Parse the AI response
    let citations;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      citations = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('AI response:', result.text);
      return NextResponse.json({ error: 'Failed to generate citations' }, { status: 500 });
    }

    return NextResponse.json({ citations });
  } catch (error) {
    console.error('Citation generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
