import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';
import { ScoreResponseDto } from './dto/calculate-score.dto';

@ApiTags('matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate matching score between CV and job' })
  @ApiResponse({ status: 200, description: 'Score calculated', type: ScoreResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async calculateScore(@Body() dto: CalculateScoreDto): Promise<ScoreResponseDto> {
    return this.matchingService.calculateScore(dto);
  }
}
