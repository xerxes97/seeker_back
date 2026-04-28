import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');
const MockedGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<
  typeof GoogleGenerativeAI
>;

describe('AiService', () => {
  let service: AiService;
  let mockGenerateContent: jest.Mock;

  beforeEach(async () => {
    mockGenerateContent = jest.fn();
    MockedGoogleGenerativeAI.mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({
            generateContent: mockGenerateContent,
          }),
        }) as unknown as GoogleGenerativeAI,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should extract job info from valid text', async () => {
    const mockResponse = {
      response: {
        text: () =>
          JSON.stringify({
            position: 'Software Engineer',
            company: 'Tech Corp',
            location: 'Remote',
            seniority: 'Senior',
            technologies: ['TypeScript', 'NestJS'],
          }),
      },
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.extractJobInfo(
      'Hiring Senior Software Engineer at Tech Corp',
    );
    expect(result.position).toBe('Software Engineer');
    expect(result.company).toBe('Tech Corp');
    expect(result.technologies).toEqual(['TypeScript', 'NestJS']);
  });

  it('should return null fields when missing', async () => {
    const mockResponse = {
      response: {
        text: () =>
          JSON.stringify({
            position: null,
            company: null,
            location: null,
            seniority: null,
            technologies: [],
          }),
      },
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.extractJobInfo('Some random text');
    expect(result.position).toBeNull();
    expect(result.technologies).toEqual([]);
  });

  it('should handle complex text with consistent structure', async () => {
    const mockResponse = {
      response: {
        text: () =>
          JSON.stringify({
            position: 'Full Stack Developer',
            company: 'Startup Inc',
            location: 'New York',
            seniority: 'Mid',
            technologies: ['React', 'Node.js', 'MongoDB'],
          }),
      },
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.extractJobInfo('Long job description here...');
    expect(result).toHaveProperty('position');
    expect(result).toHaveProperty('company');
    expect(result).toHaveProperty('location');
    expect(result).toHaveProperty('seniority');
    expect(result).toHaveProperty('technologies');
    expect(Array.isArray(result.technologies)).toBe(true);
  });

  it('should return null values on API error', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API error'));

    const result = await service.extractJobInfo('Some text');
    expect(result.position).toBeNull();
    expect(result.company).toBeNull();
    expect(result.technologies).toEqual([]);
  });

  it('should return null values on invalid JSON', async () => {
    const mockResponse = {
      response: {
        text: () => 'invalid json',
      },
    };
    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.extractJobInfo('Some text');
    expect(result.position).toBeNull();
    expect(result.technologies).toEqual([]);
  });
});
