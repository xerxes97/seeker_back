import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
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
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiResponse({
    status: 200,
    description: 'Profiles found',
    type: [ListUserProfileDto],
  })
  async getProfiles(
    @GetUserId() userId: string,
  ): Promise<ListUserProfileDto[]> {
    if (!userId) return [];
    return await this.userProfileService.getProfiles(userId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default profile' })
  @ApiResponse({
    status: 200,
    description: 'Default profile found',
    type: ListUserProfileDto,
  })
  async getDefaultProfile(
    @GetUserId() userId: string,
  ): Promise<ListUserProfileDto | null> {
    if (!userId) return null;
    return await this.userProfileService.getDefaultProfile(userId);
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
    type: ListUserProfileDto,
  })
  async getProfileById(
    @Param('profileId') profileId: string,
  ): Promise<ListUserProfileDto | null> {
    return await this.userProfileService.getProfileById(profileId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created',
    type: ListUserProfileDto,
  })
  async createProfile(
    @Body() dto: UpdateUserProfileDto,
    @GetUserId() userId: string,
  ): Promise<ListUserProfileDto> {
    return await this.userProfileService.saveProfile(userId, {
      user_id: userId,
      ...dto,
    });
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
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @GetUserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.userProfileService.processCv(
      userId,
      file.buffer,
      file.originalname,
    );
  }

  @Put(':profileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update existing user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ListUserProfileDto,
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @Param('profileId') profileId: string,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    return this.userProfileService.updateProfile(profileId, dto);
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a profile' })
  async deleteProfile(@Param('profileId') profileId: string): Promise<void> {
    await this.userProfileService.deleteProfile(profileId);
  }
}
