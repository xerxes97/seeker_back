import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update user profile with parsed CV' })
  @ApiResponse({
    status: 200,
    description: 'Profile saved successfully',
    type: ListUserProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async saveProfile(
    @Body() dto: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    return this.userProfileService.saveProfile(dto.user_id, dto);
  }

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
    @Query('user_id') user_id: string,
  ): Promise<ListUserProfileDto> {
    const profile = await this.userProfileService.getProfile(user_id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
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
    @Query('user_id') user_id: string,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    return this.userProfileService.updateProfile(user_id, dto);
  }

  // @Delete()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Soft delete user profile (sets deleted_at)' })
  // @ApiQuery({ name: 'user_id', description: 'User UUID', required: true })
  // @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  // async deleteProfile(@Query('user_id') user_id: string): Promise<void> {
  //   await this.userProfileService.(user_id);
  // }
}
