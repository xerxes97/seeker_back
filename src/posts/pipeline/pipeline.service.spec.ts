import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { OcrService } from '../services/ocr.service';
import { AiService } from '../services/ai.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { JobExtractionResult } from '../services/ai.service';

describe('PipelineService', () => {
  let pipelineService: PipelineService;
  let ocrService: jest.Mocked<OcrService>;
  let aiService: jest.Mocked<AiService>;

  const mockExtractionResult: JobExtractionResult = {
    is_job: true,
    position: 'Developer',
    company: 'Test Corp',
    location: 'Remote',
    modality: 'remote',
    seniority: 'Senior',
    salary: null,
    technologies: ['TypeScript'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        {
          provide: OcrService,
          useValue: { processImages: jest.fn() },
        },
        {
          provide: AiService,
          useValue: { processText: jest.fn() },
        },
      ],
    }).compile();

    pipelineService = module.get<PipelineService>(PipelineService);
    ocrService = module.get(OcrService);
    aiService = module.get(AiService);
  });

  it('should process post with images', async () => {
    const post: CreatePostDto = {
      postId: '123',
      text: 'hello',
      images: ['img1'],
    };
    ocrService.processImages.mockResolvedValue('ocr text');
    aiService.processText.mockResolvedValue(mockExtractionResult);

    const result = await pipelineService.processPost(post);

    expect(result).toEqual(mockExtractionResult);
    expect(ocrService.processImages).toHaveBeenCalledWith(['img1']);
    expect(aiService.processText).toHaveBeenCalledWith('123', 'hello ocr text');
  });

  it('should skip OCR when no images', async () => {
    const post: CreatePostDto = { postId: '123', text: 'hello' };
    aiService.processText.mockResolvedValue(mockExtractionResult);

    const result = await pipelineService.processPost(post);

    expect(result).toEqual(mockExtractionResult);
    expect(ocrService.processImages).not.toHaveBeenCalled();
    expect(aiService.processText).toHaveBeenCalledWith('123', 'hello');
  });

  it('should return null when OCR fails', async () => {
    const post: CreatePostDto = {
      postId: '123',
      text: 'hello',
      images: ['img1'],
    };
    ocrService.processImages.mockRejectedValue(new Error('OCR failed'));

    const result = await pipelineService.processPost(post);

    expect(result).toBeNull();
  });

  it('should return null when AI fails', async () => {
    const post: CreatePostDto = { postId: '123', text: 'hello' };
    aiService.processText.mockRejectedValue(new Error('AI failed'));

    const result = await pipelineService.processPost(post);

    expect(result).toBeNull();
  });

  it('should process multiple posts', async () => {
    const posts: CreatePostDto[] = [
      { postId: '123', text: 'hello' },
      { postId: '456', text: 'world' },
    ];
    aiService.processText.mockResolvedValue(mockExtractionResult);

    const results = await pipelineService.processPosts(posts);

    expect(results).toEqual([mockExtractionResult, mockExtractionResult]);
  });
});
