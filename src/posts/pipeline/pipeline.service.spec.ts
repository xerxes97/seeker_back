import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { OcrService } from '../services/ocr.service';
import { AiService } from '../services/ai.service';
import { CreatePostDto } from '../dto/create-post.dto';

describe('PipelineService', () => {
  let pipelineService: PipelineService;
  let ocrService: jest.Mocked<OcrService>;
  let aiService: jest.Mocked<AiService>;

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
    aiService.processText.mockResolvedValue(undefined);

    const result = await pipelineService.processPost(post);

    expect(result).toEqual({ postId: '123', processed: true });
    expect(ocrService.processImages).toHaveBeenCalledWith(['img1']);
    expect(aiService.processText).toHaveBeenCalledWith('123', 'hello ocr text');
  });

  it('should skip OCR when no images', async () => {
    const post: CreatePostDto = { postId: '123', text: 'hello' };
    aiService.processText.mockResolvedValue(undefined);

    const result = await pipelineService.processPost(post);

    expect(result).toEqual({ postId: '123', processed: true });
    expect(ocrService.processImages).not.toHaveBeenCalled();
    expect(aiService.processText).toHaveBeenCalledWith('123', 'hello');
  });

  it('should log error when OCR fails', async () => {
    const post: CreatePostDto = {
      postId: '123',
      text: 'hello',
      images: ['img1'],
    };
    ocrService.processImages.mockRejectedValue(new Error('OCR failed'));

    const result = await pipelineService.processPost(post);

    expect(result).toEqual({ postId: '123', processed: false });
  });

  it('should log error when AI fails', async () => {
    const post: CreatePostDto = { postId: '123', text: 'hello' };
    aiService.processText.mockRejectedValue(new Error('AI failed'));

    const result = await pipelineService.processPost(post);

    expect(result).toEqual({ postId: '123', processed: false });
  });

  it('should process multiple posts', async () => {
    const posts: CreatePostDto[] = [
      { postId: '123', text: 'hello' },
      { postId: '456', text: 'world' },
    ];
    aiService.processText.mockResolvedValue(undefined);

    const results = await pipelineService.processPosts(posts);

    expect(results).toEqual([
      { postId: '123', processed: true },
      { postId: '456', processed: true },
    ]);
  });
});
