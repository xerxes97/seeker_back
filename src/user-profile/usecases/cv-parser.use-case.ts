import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PDFParse } from 'pdf-parse';
import Groq from 'groq-sdk';
import { CvParserOutput, MammothResult } from '../interfaces';

@Injectable()
export class CvParserUseCase {
  private readonly logger = new Logger(CvParserUseCase.name);
  private readonly groq: Groq;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.groq = new Groq({
      apiKey: configService.get('GROQ_API_KEY') || '',
    });
    this.model = configService.get('MODEL') || 'llama-3.3-70b-versatile';
  }

  async processCv(
    buffer: Buffer,
    originalname: string,
  ): Promise<CvParserOutput> {
    const ext = originalname.split('.').pop()?.toLowerCase();
    const text = await this.extractText(buffer, ext);
    return this.parseWithAI(text);
  }

  private async extractText(
    buffer: Buffer,
    ext: string | undefined,
  ): Promise<string> {
    if (ext === 'pdf') {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    }

    if (ext === 'docx' || ext === 'doc') {
      const result = await this.extractDocxText(buffer);
      return result.value;
    }

    throw new BadRequestException(
      'Only PDF and Word (.doc, .docx) files are accepted',
    );
  }

  private extractDocxText(buffer: Buffer): Promise<MammothResult> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<MammothResult>;
    };
    return mammoth.extractRawText({ buffer });
  }

  private async parseWithAI(text: string): Promise<CvParserOutput> {
    const maxChars = 12000;
    const truncated = text.length > maxChars ? text.slice(0, maxChars) : text;

    const prompt = `Extract CV data as JSON. null if missing.

personalInfo: {name, email, phone, linkedIn}
summary: string
skills: {raw: section text, parsed: string[]}
experience: {raw: section text, parsed: [{position, company, dates, description}]}
education: {raw: section text, parsed: [{degree, institution, dates}]}
languages: {raw: section text, parsed: string[]}
certifications: {raw: section text, parsed: string[]}
projects: string

JSON only. No explanation.

CV:
${truncated}`;

    const result = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.model,
      response_format: { type: 'json_object' },
    });

    const content = result.choices[0]?.message?.content || '{}';
    const parsed = this.safeParse(content) as Record<string, unknown>;

    const sections = [
      'summary',
      'skills',
      'experience',
      'education',
      'languages',
      'certifications',
      'projects',
    ];
    const rawSections = sections.filter(
      (s) => parsed[s] !== undefined && parsed[s] !== null && parsed[s] !== '',
    );

    const personalInfo = parsed.personalInfo as
      | Record<string, unknown>
      | undefined;

    const buildSection = <T>(
      key: string,
    ): { raw: string; parsed: T[] } | undefined => {
      const section = parsed[key] as { raw?: string; parsed?: T[] } | undefined;
      if (!section) return undefined;
      return {
        raw: typeof section.raw === 'string' ? section.raw : '',
        parsed: Array.isArray(section.parsed) ? section.parsed : [],
      };
    };

    const str = (v: unknown): string | null =>
      typeof v === 'string' ? v : null;

    return {
      personalInfo: {
        name: str(personalInfo?.name),
        email: str(personalInfo?.email),
        phone: str(personalInfo?.phone),
        linkedIn: str(personalInfo?.linkedIn),
      },
      ...(str(parsed.summary) ? { summary: str(parsed.summary)! } : {}),
      ...(parsed.skills ? { skills: buildSection<string>('skills')! } : {}),
      ...(parsed.experience
        ? {
            experience: buildSection<{
              position: string;
              company: string;
              dates: string;
              description: string;
            }>('experience')!,
          }
        : {}),
      ...(parsed.education
        ? {
            education: buildSection<{
              degree: string;
              institution: string;
              dates: string;
            }>('education')!,
          }
        : {}),
      ...(parsed.languages
        ? { languages: buildSection<string>('languages')! }
        : {}),
      ...(parsed.certifications
        ? { certifications: buildSection<string>('certifications')! }
        : {}),
      ...(str(parsed.projects) ? { projects: str(parsed.projects)! } : {}),
      _rawSections: rawSections,
    };
  }

  private safeParse(text: string): unknown {
    const cleaned = text.replaceAll('```json', '').replaceAll('```', '').trim();

    const match = new RegExp(/\{[\s\S]*\}/).exec(cleaned);
    if (!match) {
      this.logger.warn('No JSON found in AI response, returning empty object');
      return {};
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      const balanced = this.extractBalancedJson(match[0]);
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
}
