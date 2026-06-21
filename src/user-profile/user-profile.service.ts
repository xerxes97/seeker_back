import { Injectable, Inject, Logger } from '@nestjs/common';
import { UserProfileRepository } from './interfaces/repository';
import { CvParserUseCase } from './usecases/cv-parser.use-case';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(
    @Inject('UserProfileRepository')
    private readonly repo: UserProfileRepository,
    private readonly cvParser: CvParserUseCase,
  ) {}

  async processCv(
    userId: string,
    buffer: Buffer,
    originalname: string,
  ): Promise<ListUserProfileDto | null> {
    const { personalInfo, skills } = await this.cvParser.processCv(
      buffer,
      originalname,
    );

    this.logger.log('=== CV PARSED DATA ===');
    this.logger.log(`File: ${originalname}`);
    this.logger.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
    this.logger.log('--- Modules ---');
    this.logger.log('=== END CV ===');
    return await this.saveProfile(userId, {
      user_id: userId,
      name: personalInfo?.name || '',
      skills: skills?.parsed || [],
    });
  }

  async saveProfile(
    userId: string,
    dto: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    return this.repo.save(userId, dto);
  }

  async getProfiles(userId: string): Promise<ListUserProfileDto[]> {
    return this.repo.findByUserId(userId);
  }

  async getProfileById(profileId: string): Promise<ListUserProfileDto | null> {
    return this.repo.findById(profileId);
  }

  async getDefaultProfile(userId: string): Promise<ListUserProfileDto | null> {
    const profiles = await this.repo.findByUserId(userId);
    return profiles[0] ?? null;
  }

  async updateProfile(
    profileId: string,
    dto: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    return await this.repo.update(profileId, dto);
  }

  async deleteProfile(profileId: string): Promise<void> {
    await this.repo.delete(profileId);
  }
}
