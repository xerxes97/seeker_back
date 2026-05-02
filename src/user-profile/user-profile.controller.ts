import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('user-profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or update user profile' })
  @ApiResponse({ status: 200, description: 'Profile created/updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createOrUpdate(@Body() dto: CreateUserProfileDto) {
    const profile = await this.userProfileService.createOrUpdate(dto);
    return {
      status: 'success',
      data: profile,
    };
  }

  @Get(':user_id')
  @ApiOperation({ summary: 'Get user profile by user ID' })
  @ApiParam({ name: 'user_id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Profile found' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findByUserId(@Param('user_id') user_id: string) {
    const profile = await this.userProfileService.findByUserId(user_id);
    return {
      user_id: profile.user_id,
      skills: profile.skills,
      roles: profile.roles,
      experience_years: profile.experience_years,
      seniority: profile.seniority,
    };
  }

  @Put(':user_id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'user_id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async update(@Param('user_id') user_id: string, @Body() dto: UpdateUserProfileDto) {
    const profile = await this.userProfileService.update(user_id, dto);
    return {
      status: 'success',
      data: profile,
    };
  }
}
