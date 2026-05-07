import { Test, TestingModule } from '@nestjs/testing';
import { OcrService } from './ocr.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OcrService', () => {
  let service: OcrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrService],
    }).compile();

    service = module.get<OcrService>(OcrService);
  });

  it('should extract text from single image', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        OCRExitCode: 1,
        ParsedResults: [{ ParsedText: 'Hello World' }],
      },
    });

    const result = await service.processImages([
      'http://example.com/image.jpg',
    ]);
    expect(result).toBe('Hello World');
  });

  it('should concatenate text from multiple images', async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: {
          OCRExitCode: 1,
          ParsedResults: [{ ParsedText: 'First' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          OCRExitCode: 1,
          ParsedResults: [{ ParsedText: 'Second' }],
        },
      });

    const result = await service.processImages([
      'http://example.com/img1.jpg',
      'http://example.com/img2.jpg',
    ]);
    expect(result).toBe('First Second');
  });

  it('should return empty string on OCR error', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { OCRExitCode: 0 },
    });

    const result = await service.processImages([
      'http://example.com/image.jpg',
    ]);
    expect(result).toBe('');
  });

  it('should return empty string on network error', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Network error'));

    const result = await service.processImages([
      'http://example.com/image.jpg',
    ]);
    expect(result).toBe('');
  });

  it('should handle empty images array', async () => {
    const result = await service.processImages([]);
    expect(result).toBe('');
  });
});
