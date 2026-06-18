import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { PrismaService } from '../../core/db/prisma.service';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { DEFAULT_SCORE_NOTIFICATION } from '../../core/constants/notification.constants';

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    const count = await this.prisma.userProfile.count({
      where: { userId },
    });

    const data = {
      userId,
      name: profile.name ?? null,
      lastname: profile.lastname ?? null,
      skills: profile.skills ?? [],
      roles: profile.roles ?? [],
      experienceYears: profile.experience_years ?? 0,
      seniority: (profile.seniority as any) ?? null,
      location: profile.location ?? null,
      department: profile.department ?? null,
      modality: (profile.modality as any) ?? [],
      scoreNotification:
        profile.scoreNotification ?? DEFAULT_SCORE_NOTIFICATION,
      salaryMin: profile.salaryMin ?? null,
      salaryMax: profile.salaryMax ?? null,
      isDefault: count === 0,
    };

    const created = await this.prisma.userProfile.create({ data });
    return this.toDto(created);
  }

  async findByUserId(userId: string): Promise<ListUserProfileDto[]> {
    const profiles = await this.prisma.userProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map((p) => this.toDto(p));
  }

  async findById(profileId: string): Promise<ListUserProfileDto | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
    });
    if (!profile) return null;
    return this.toDto(profile);
  }

  async update(
    profileId: string,
    profile: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    const existing = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
    });
    if (!existing) return null;

    const data: any = {};
    if (profile.name !== undefined) data.name = profile.name;
    if (profile.lastname !== undefined) data.lastname = profile.lastname;
    if (profile.skills !== undefined) data.skills = profile.skills;
    if (profile.roles !== undefined) data.roles = profile.roles;
    if (profile.experience_years !== undefined)
      data.experienceYears = profile.experience_years;
    if (profile.seniority !== undefined)
      data.seniority = profile.seniority as any;
    if (profile.location !== undefined) data.location = profile.location;
    if (profile.department !== undefined) data.department = profile.department;
    if (profile.modality !== undefined) data.modality = profile.modality as any;
    if (profile.scoreNotification !== undefined)
      data.scoreNotification = profile.scoreNotification;
    if (profile.salaryMin !== undefined) data.salaryMin = profile.salaryMin;
    if (profile.salaryMax !== undefined) data.salaryMax = profile.salaryMax;

    const updated = await this.prisma.userProfile.update({
      where: { id: profileId },
      data,
    });
    return this.toDto(updated);
  }

  async delete(profileId: string): Promise<void> {
    await this.prisma.userProfile.delete({ where: { id: profileId } });
  }

  async setDefault(userId: string, profileId: string): Promise<void> {
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    await this.prisma.userProfile.update({
      where: { id: profileId },
      data: { isDefault: true },
    });
  }

  private toDto(profile: any): ListUserProfileDto {
    return {
      id: profile.id,
      user_id: profile.userId,
      name: profile.name ?? undefined,
      lastname: profile.lastname ?? undefined,
      skills: profile.skills,
      roles: profile.roles,
      experience_years: profile.experienceYears,
      seniority: profile.seniority,
      location: profile.location ?? undefined,
      department: profile.department ?? undefined,
      modality: profile.modality,
      scoreNotification: profile.scoreNotification ?? undefined,
      salaryMin: profile.salaryMin ?? undefined,
      salaryMax: profile.salaryMax ?? undefined,
      is_default: profile.isDefault,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
      deleted_at: profile.deletedAt,
    } as unknown as ListUserProfileDto;
  }
}
