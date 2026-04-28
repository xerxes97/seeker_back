import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || '',
  ).getGenerativeModel({ model: 'gemini-1.5-flash' });

  async processText(postId: string, text: string): Promise<void> {
    try {
      const result = await this.extractJobInfo(text);
      this.logger.log(`Post ${postId} extracted: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `AI extraction failed for post ${postId}: ${(error as Error).message}`,
      );
    }
  }

  async extractJobInfo(text: string): Promise<{
    position: string | null;
    company: string | null;
    location: string | null;
    seniority: string | null;
    technologies: string[];
  }> {
    const prompt = `Classify and extract job data. Return JSON:
is_job, position, company, location, seniority, technologies[].
If not job: is_job=false, others=null. No text.

Text: ${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const parsed = JSON.parse(response) as {
        position?: string;
        company?: string;
        location?: string;
        seniority?: string;
        technologies?: string[];
      };
      return {
        position: parsed.position || null,
        company: parsed.company || null,
        location: parsed.location || null,
        seniority: parsed.seniority || null,
        technologies: Array.isArray(parsed.technologies)
          ? parsed.technologies
          : [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to extract job info: ${(error as Error).message}`,
      );
      return {
        position: null,
        company: null,
        location: null,
        seniority: null,
        technologies: [],
      };
    }
  }
}
