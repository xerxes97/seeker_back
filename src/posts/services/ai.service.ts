import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  processText(_postId: string, _text: string): Promise<void> {
    void _postId;
    void _text;
    // TODO: Implement actual AI logic (HU-09)
    return Promise.resolve();
  }
}
