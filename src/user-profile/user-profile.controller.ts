import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { GetUserId } from 'src/auth/decorators/get-user.decorator';

@ApiTags('user-profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiQuery({ name: 'user_id', description: 'User UUID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ListUserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(
    @GetUserId() userId: string,
  ): Promise<ListUserProfileDto | null> {
    if (!userId) return null;
    return await this.userProfileService.getProfile(userId);
  }

  @Post('cv')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload CV (PDF/Word) and extract structured data' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CV file in PDF or Word format',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'CV parsed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or no file uploaded' })
  async uploadCv(@UploadedFile() file: Express.Multer.File, @GetUserId() userId: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.userProfileService.processCv(userId, file.buffer, file.originalname);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update existing user profile' })
  @ApiQuery({ name: 'user_id', description: 'User UUID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ListUserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @Body() dto: UpdateUserProfileDto,
    @GetUserId() userId: string,
  ): Promise<ListUserProfileDto | null> {
    if (!userId) return null;
    return this.userProfileService.updateProfile(userId, dto);
  }
}
