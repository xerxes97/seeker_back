import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

describe('AiService', () => {
  let service: AiService;
  let mockChatCompletionsCreate: jest.Mock;

  beforeEach(async () => {
    mockChatCompletionsCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GROQ_API_KEY') return 'test-key';
              if (key === 'MODEL') return 'test-model';
              return null;
            }),
          },
        },
      ],
    })
      .overrideProvider(AiService)
      .useFactory({
        factory: () => {
          const service = new AiService(new ConfigService());
          (service as any).groq = {
            chat: {
              completions: {
                create: mockChatCompletionsCreate,
              },
            },
          };
          return service;
        },
      })
      .compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should extract job info from valid text', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              is_job: true,
              position: 'Software Engineer',
              company: 'Tech Corp',
              location: 'Remote',
              modality: 'remote',
              salary: null,
              skills: ['TypeScript', 'NestJS'],
            }),
          },
        },
      ],
    };
    mockChatCompletionsCreate.mockResolvedValue(mockResponse);

    const result = await service.processText(
      '123',
      'Hiring Senior Software Engineer at Tech Corp',
    );
    expect(result).toMatchObject({
      is_job: true,
      position: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      modality: 'remote',
      skills: ['TypeScript', 'NestJS'],
    });
  });

  it('should return null fields when missing', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              is_job: false,
              position: null,
              company: null,
              location: null,
              modality: null,
              salary: null,
              skills: [],
            }),
          },
        },
      ],
    };
    mockChatCompletionsCreate.mockResolvedValue(mockResponse);

    const result = await service.processText('123', 'Some random text');
    expect(result?.position).toBeNull();
    expect(result?.skills).toEqual([]);
  });

  it('should handle complex text with consistent structure', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              is_job: true,
              position: 'Full Stack Developer',
              company: 'Startup Inc',
              location: 'New York',
              modality: 'onsite',
              salary: null,
              skills: ['React', 'Node.js', 'MongoDB'],
            }),
          },
        },
      ],
    };
    mockChatCompletionsCreate.mockResolvedValue(mockResponse);

    const result = await service.processText(
      '123',
      'Long job description here...',
    );
    expect(result).toHaveProperty('position');
    expect(result).toHaveProperty('company');
    expect(result).toHaveProperty('location');
    expect(result).toHaveProperty('skills');
    expect(Array.isArray(result?.skills)).toBe(true);
  });

  it('should return null on API error', async () => {
    mockChatCompletionsCreate.mockRejectedValue(new Error('API error'));

    const result = await service.processText('123', 'Some text');
    expect(result).toBeNull();
  });

  it('should return null on invalid JSON', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'invalid json',
          },
        },
      ],
    };
    mockChatCompletionsCreate.mockResolvedValue(mockResponse);

    const result = await service.processText('123', 'Some text');
    expect(result).toBeNull();
  });
});
