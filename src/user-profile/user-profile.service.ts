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
    buffer: Buffer,
    originalname: string,
  ): Promise<Record<string, unknown>> {
    const modules = await this.cvParser.processCv(buffer, originalname);

    this.logger.log('=== CV PARSED DATA ===');
    this.logger.log(`File: ${originalname}`);
    this.logger.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
    this.logger.log('--- Modules ---');
    for (const [key, value] of Object.entries(modules)) {
      this.logger.log(`${key}: ${JSON.stringify(value, null, 2)}`);
    }
    this.logger.log('=== END CV ===');

    return modules;
  }

  async saveProfile(
    userId: string,
    dto: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    return this.repo.save(userId, dto);
  }

  async getProfile(userId: string): Promise<ListUserProfileDto | null> {
    return this.repo.findByUserId(userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    return await this.repo.update(userId, dto);
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.repo.delete(userId);
  }
}
