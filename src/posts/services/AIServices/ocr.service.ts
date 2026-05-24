import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async processImages(images: string[]): Promise<string> {
    try {
      const results = await Promise.all(
        images.map((image) => this.extractTextFromImage(image)),
      );
      return results.filter((text) => text.length > 0).join(' ');
    } catch (error) {
      this.logger.error(`OCR failed: ${(error as Error).message}`);
      return '';
    }
  }

  private async extractTextFromImage(imageUrl: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.ocr.space/parse/imageurl',
        new URLSearchParams({
          apikey: 'helloworld',
          url: imageUrl,
          language: 'eng',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const data = response.data as {
        OCRExitCode: number;
        ParsedResults?: Array<{ ParsedText?: string }>;
      };

      if (data.OCRExitCode === 1) {
        return data.ParsedResults?.[0]?.ParsedText || '';
      }
      this.logger.warn(`OCR API returned non-success: ${data.OCRExitCode}`);
      return '';
    } catch (error) {
      this.logger.error(`OCR extraction failed: ${(error as Error).message}`);
      return '';
    }
  }
}
