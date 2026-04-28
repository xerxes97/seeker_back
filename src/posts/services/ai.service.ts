import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface JobExtractionResult {
  postId: string;
  is_job: boolean | null;
  position: string | null;
  company: string | null;
  location: string | null;
  modality: string | null;
  seniority: string | null;
  salary: {
    min: number | null;
    max: number | null;
    currency: string | null;
    period: string | null;
  } | null;
  technologies: string[];
}

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
is_job, position, company, location, modality, seniority, salary, technologies[].

Modality: remote|hybrid|onsite.
Salary: {min, max, currency (USD|EUR|COP), period (hour|month|year)}.

If not job: is_job=false, others=null.
Use null if missing. No text.

Text: ${text}`;

    const result = await this.groq.chat.completions.create({
      messages: [{
        role: "user",
        content: prompt
      }],
      model: this.model
    });
    const response = result.choices[0]?.message?.content || "";
    const parsed = this.safeParse(response) as Partial<JobExtractionResult>;
    return {
      postId: "",
      is_job: parsed.is_job ?? null,
      position: parsed.position || null,
      company: parsed.company || null,
      location: parsed.location || null,
      modality: parsed.modality || null,
      seniority: parsed.seniority || null,
      salary: parsed.salary ?? null,
      technologies: Array.isArray(parsed.technologies)
        ? parsed.technologies
        : [],
     };
   }

   private safeParse(text: string): unknown {
    const cleaned = this.cleanJsonResponse(text);

    const match = new RegExp(/\{[\s\S]*\}/).exec(cleaned);
    if (!match) {
      throw new Error('No JSON found');
    }

    return JSON.parse(match[0]);
  }

  private cleanJsonResponse(text: string): string {
    return text.replaceAll('```json', '').replaceAll('```', '').trim();
  }
}
