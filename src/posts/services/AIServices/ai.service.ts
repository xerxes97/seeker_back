import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { JobExtractionResult } from 'src/posts/dto/ia.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly configService: ConfigService;
  private readonly groq: Groq;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY') || '',
    });
    this.model = this.configService.get('MODEL') || 'llama-3.3-70b-versatile';
  }

  async processText(
    postId: string,
    text: string,
  ): Promise<JobExtractionResult | null> {
    try {
      const result = await this.extractJobInfo(text);
      this.logger.log(`Post ${postId} extracted: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(
        `AI extraction failed for post ${postId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  private async extractJobInfo(text: string): Promise<JobExtractionResult> {
    const prompt = `Classify and extract job data. Return JSON:
is_job, position, company, location, modality, experience_years, salary, skills[], benefits[], contact.

Modality: remote|hybrid|onsite.
Salary: {min, max, currency (USD|EUR|COP), period (hour|month|year)}.
benefits: string[].
contact: {email, phone, link}

If not job: is_job=false, others=null.
Use null if missing. No text.

Text: ${text}`;

    const result = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: this.model,
    });
    const response = result.choices[0]?.message?.content || '';
    const parsed = this.safeParse(response) as Partial<JobExtractionResult>;
    return {
      postId: '',
      is_job: parsed.is_job ?? null,
      position: parsed.position || null,
      company: parsed.company || null,
      location: parsed.location || null,
      modality: parsed.modality || null,
      experience_years: parsed.experience_years || null,
      salary: parsed.salary ?? null,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      contact: parsed.contact ?? null,
      score: null,
      notify: true,
    };
  }

  private safeParse(text: string): unknown {
    const cleaned = this.cleanJsonResponse(text);

    const match = new RegExp(/\{[\s\S]*\}/).exec(cleaned);
    if (!match) {
      throw new Error('No JSON found');
    }

    const jsonStr = match[0];
    try {
      return JSON.parse(jsonStr);
    } catch {
      const balanced = this.extractBalancedJson(jsonStr);
      return JSON.parse(balanced);
    }
  }

  private extractBalancedJson(text: string): string {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          return text.slice(start, i + 1);
        }
      }
    }
    throw new Error('No balanced JSON found');
  }

  private cleanJsonResponse(text: string): string {
    return text.replaceAll('```json', '').replaceAll('```', '').trim();
  }
}
