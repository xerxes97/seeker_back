import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileService } from './user-profile.service';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';

jest.mock('./repository/user-profile.repository');

describe('UserProfileService', () => {
  let service: UserProfileService;
  let mockRepo: jest.Mocked<UserProfileRepositoryImpl>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProfileService, UserProfileRepositoryImpl],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    mockRepo = module.get(UserProfileRepositoryImpl) as jest.Mocked<UserProfileRepositoryImpl>;
  });

  it('should save profile and return the saved object', async () => {
    mockRepo.save.mockResolvedValue(undefined);
    mockRepo.findByUserId.mockResolvedValue(null);

    const dto: CreateUserProfileDto = {
      user_id: 'user-123',
      skills: ['javascript', 'typescript'],
      roles: ['Developer'],
      experience_years: 3,
      seniority: 'mid' as any,
    };

    const result = await service.saveProfile('user-123', dto);
    expect(result.user_id).toBe('user-123');
    expect(result.skills).toEqual(['javascript', 'typescript']);
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
  });

  it('should overwrite existing profile on save', async () => {
    const existingProfile: ListUserProfileDto = {
      id: 'user-123',
      user_id: 'user-123',
      skills: ['old-skill'],
      roles: ['Old Role'],
      experience_years: 1,
      seniority: 'junior',
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
    };
    
    mockRepo.findByUserId.mockResolvedValue(existingProfile);
    mockRepo.save.mockResolvedValue(undefined);

    const dto: CreateUserProfileDto = {
      user_id: 'user-123',
      skills: ['new-skill'],
      roles: ['New Role'],
      experience_years: 2,
      seniority: 'mid' as any,
    };

    const result = await service.saveProfile('user-123', dto);
    expect(result.skills).toEqual(['new-skill']);
    expect(result.created_at).toBe(existingProfile.created_at); // Preserves original created_at
  });

  it('should return null when profile not found', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);

    const result = await service.getProfile('non-existent');
    expect(result).toBeNull();
  });

  it('should return profile when it exists', async () => {
    const profile: ListUserProfileDto = {
      id: 'user-123',
      user_id: 'user-123',
      skills: ['javascript'],
      roles: ['Developer'],
      experience_years: 3,
      seniority: 'mid',
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
    };
    
    mockRepo.findByUserId.mockResolvedValue(profile);

    const result = await service.getProfile('user-123');
    expect(result).toEqual(profile);
  });

  it('should update existing profile and return updated object', async () => {
    const existingProfile: ListUserProfileDto = {
      id: 'user-123',
      user_id: 'user-123',
      skills: ['old-skill'],
      roles: ['Old Role'],
      experience_years: 1,
      seniority: 'junior',
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
    };

    mockRepo.findByUserId.mockResolvedValue(existingProfile);
    mockRepo.save.mockResolvedValue(undefined);

    const updateDto: UpdateUserProfileDto = {
      skills: ['updated-skill'],
      experience_years: 2,
    };

    const result = await service.updateProfile('user-123', updateDto);
    expect(result.skills).toEqual(['updated-skill']);
    expect(result.experience_years).toBe(2);
    expect(result.roles).toEqual(['Old Role']); // Preserved from existing
    expect(result.created_at).toBe(existingProfile.created_at); // Preserved
  });

  it('should throw error when updating non-existent profile', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);

    const updateDto: UpdateUserProfileDto = {
      skills: ['updated-skill'],
    };

    await expect(service.updateProfile('non-existent', updateDto)).rejects.toThrow('Profile not found');
  });

  it('should soft delete profile by setting deleted_at', async () => {
    const existingProfile: ListUserProfileDto = {
      id: 'user-123',
      user_id: 'user-123',
      skills: ['javascript'],
      roles: ['Developer'],
      experience_years: 3,
      seniority: 'mid',
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
    };

    mockRepo.findByUserId.mockResolvedValue(existingProfile);
    mockRepo.save.mockResolvedValue(undefined);

    await service.deleteProfile('user-123');
    expect(mockRepo.save).toHaveBeenCalledWith('user-123', expect.objectContaining({
      deleted_at: expect.any(String),
    }));
  });

  it('should not error when deleting non-existent profile', async () => {
    mockRepo.findByUserId.mockResolvedValue(null);

    await expect(service.deleteProfile('non-existent')).resolves.not.toThrow();
  });
});
