import { Injectable, BadRequestException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

interface MammothResult {
  value: string;
  messages: unknown[];
}

interface ExperienceEntry {
  position: string;
  company: string;
  dates: string;
  description: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
}

const SECTION_HEADERS: { key: string; patterns: RegExp[] }[] = [
  {
    key: 'summary',
    patterns: [
      /summary/i,
      /profile/i,
      /objective/i,
      /about\s+me/i,
      /resumen/i,
      /perfil/i,
      /objetivo/i,
    ],
  },
  {
    key: 'experience',
    patterns: [
      /experience/i,
      /employment/i,
      /work\s+history/i,
      /professional\s+background/i,
      /experiencia/i,
      /trabajo/i,
      /historial\s+laboral/i,
      /antecedentes\s+profesionales/i,
    ],
  },
  {
    key: 'education',
    patterns: [
      /education/i,
      /academic/i,
      /qualifications/i,
      /training/i,
      /educación/i,
      /formación\s+académica/i,
      /formación/i,
      /estudios/i,
    ],
  },
  {
    key: 'skills',
    patterns: [
      /skills/i,
      /competencies/i,
      /technologies/i,
      /expertise/i,
      /habilidades/i,
      /competencias/i,
      /aptitudes/i,
      /conocimientos/i,
    ],
  },
  { key: 'languages', patterns: [/languages/i, /idiomas/i] },
  {
    key: 'certifications',
    patterns: [
      /certifications/i,
      /licenses/i,
      /credentials/i,
      /certificaciones/i,
      /licencias/i,
      /acreditaciones/i,
    ],
  },
  { key: 'projects', patterns: [/projects/i, /portfolio/i, /proyectos/i] },
  { key: 'publications', patterns: [/publications/i, /papers/i, /publicaciones/i] },
];

@Injectable()
export class CvParserUseCase {
  async processCv(
    buffer: Buffer,
    originalname: string,
  ): Promise<Record<string, unknown>> {
    const ext = originalname.split('.').pop()?.toLowerCase();
    const text = await this.extractText(buffer, ext);
    return this.parseCvText(text);
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

  private parseCvText(text: string): Record<string, unknown> {
    const sections = this.splitIntoSections(text);

    const headerText = sections.__header__ ?? text.slice(0, 500);
    const email = this.extractEmail(headerText);
    const phone = this.extractPhone(headerText);
    const linkedIn = this.extractLinkedIn(headerText);
    const name = this.extractName(headerText);

    const modules: Record<string, unknown> = {
      personalInfo: {
        name,
        email,
        phone,
        linkedIn,
      },
    };

    if (sections.summary) {
      modules.summary = sections.summary;
    }

    if (sections.skills) {
      modules.skills = {
        raw: sections.skills,
        parsed: this.parseSkillsSection(sections.skills),
      };
    }

    if (sections.experience) {
      modules.experience = {
        raw: sections.experience,
        parsed: this.parseExperienceSection(sections.experience),
      };
    }

    if (sections.education) {
      modules.education = {
        raw: sections.education,
        parsed: this.parseEducationSection(sections.education),
      };
    }

    if (sections.languages) {
      modules.languages = {
        raw: sections.languages,
        parsed: sections.languages
          .split(/[,\n]/)
          .map((l) => l.trim())
          .filter(Boolean),
      };
    }

    if (sections.certifications) {
      modules.certifications = {
        raw: sections.certifications,
        parsed: sections.certifications
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      };
    }

    if (sections.projects) {
      modules.projects = sections.projects;
    }

    modules._rawSections = Object.keys(sections).filter(
      (k) => k !== '__header__',
    );

    return modules;
  }

  private splitIntoSections(text: string): Record<string, string> {
    const lines = text.split('\n');
    const sections: Record<string, string> = {};
    let currentSection = '__header__';
    const headerLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      let matched = false;

      for (const section of SECTION_HEADERS) {
        if (
          section.patterns.some((p) => p.test(trimmed)) &&
          trimmed.length < 100
        ) {
          currentSection = section.key;
          sections[currentSection] = sections[currentSection] ?? '';
          matched = true;
          break;
        }
      }

      if (!matched) {
        if (currentSection === '__header__') {
          headerLines.push(trimmed);
        } else {
          sections[currentSection] += trimmed + '\n';
        }
      }
    }

    if (headerLines.length > 0) {
      sections.__header__ = headerLines.join('\n');
    }

    for (const key of Object.keys(sections)) {
      sections[key] = sections[key].trim();
    }

    return sections;
  }

  private parseExperienceSection(text: string): ExperienceEntry[] {
    const entries: ExperienceEntry[] = [];
    const blocks = text.split(/\n\s*\n/).filter(Boolean);

    for (const block of blocks) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) continue;

      const entry: ExperienceEntry = {
        position: '',
        company: '',
        dates: '',
        description: '',
      };
      const dateMatch = block.match(
        /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*[\s.-]?\d{4}\s*(?:-|–|to|–|present|now|actualidad)\s*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*[\s.-]?\d{4}|present|now|actualidad)?)/i,
      );

      if (dateMatch) {
        entry.dates = dateMatch[0].trim();
      }

      const dashLine = lines.find(
        (l) => l.includes(' - ') || l.includes(' – ') || l.includes(' | '),
      );
      if (dashLine && !dashLine.match(/^\d/)) {
        const parts = dashLine.split(/[-–|]/).map((p) => p.trim());
        if (parts.length >= 2) {
          entry.position = parts[0];
          entry.company = parts[1];
        }
      }

      if (
        !entry.position &&
        lines[0] &&
        !lines[0].match(/^\d/) &&
        !lines[0].match(/present|now|actualidad/i)
      ) {
        entry.position = lines[0];
        if (
          lines[1] &&
          !lines[1].match(/^\d/) &&
          !lines[1].match(/present|now|actualidad/i)
        ) {
          entry.company = lines[1];
        }
      }

      const linesWithoutDate = lines.filter(
        (l) => l !== entry.dates && l !== dashLine,
      );
      entry.description = linesWithoutDate
        .filter((l) => l !== entry.position && l !== entry.company)
        .join(' ')
        .trim();

      entries.push(entry);
    }

    return entries;
  }

  private parseEducationSection(text: string): EducationEntry[] {
    const entries: EducationEntry[] = [];
    const blocks = text.split(/\n\s*\n/).filter(Boolean);

    for (const block of blocks) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) continue;

      const entry: EducationEntry = { degree: '', institution: '', dates: '' };
      const dateMatch = block.match(
        /(\d{4}\s*(?:-|–)\s*(?:\d{4}|present|now|actualidad))/,
      );
      if (dateMatch) {
        entry.dates = dateMatch[0].trim();
      }

      const degreeKeywords =
        /(?:bachelor|master|phd|doctor|degree|diploma|licenciatura|ingeniería|ingeniero|bachiller|técnico|tecnólogo|maestría|doctorado|diplomatura|carrera|curso|especialización|máster)/i;
      const degreeLine = lines.find((l) => degreeKeywords.test(l));
      if (degreeLine) {
        entry.degree = degreeLine;
      }

      if (lines.length > 0) {
        const nonDegreeLines = lines.filter(
          (l) => l !== degreeLine && l !== entry.dates,
        );
        entry.institution = nonDegreeLines[0] ?? '';
      }

      entries.push(entry);
    }

    return entries;
  }

  private parseSkillsSection(text: string): string[] {
    const skills = text
      .split(/[,\n•·\-|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 50);
    return [...new Set(skills)];
  }

  private extractEmail(text: string): string | null {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match?.[0] ?? null;
  }

  private extractPhone(text: string): string | null {
    const match = text.match(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
    );
    return match?.[0] ?? null;
  }

  private extractLinkedIn(text: string): string | null {
    const match = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    return match?.[0] ?? null;
  }

  private extractName(text: string): string | null {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines.slice(0, 5)) {
      if (
        line.length > 2 &&
        line.length < 60 &&
        !line.includes('@') &&
        !line.match(/http|<|>|\d{3,}/) &&
        line.match(/^[A-Z][a-záéíóúüñ]+(?:\s+[A-Z][a-záéíóúüñ]+)+/)
      ) {
        return line;
      }
    }
    return null;
  }
}
