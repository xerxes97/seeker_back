import { Injectable } from '@nestjs/common';

@Injectable()
export class OcrService {
  processImages(_images: string[]): Promise<string> {
    void _images;
    // TODO: Implement actual OCR logic (HU-08)
    return Promise.resolve('');
  }
}
