import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { PrismaService } from '../../core/db/prisma.service';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

const userInclude = {
  user: {
    select: {
      experienceYears: true,
      location: true,
      department: true,
      modality: true,
      seniority: true,
      scoreNotification: true,
      salaryMin: true,
      salaryMax: true,
    },
  },
};

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    const data = {
      userId,
      name: profile.name ?? null,
      lastname: profile.lastname ?? null,
      skills: profile.skills ?? [],
      roles: profile.roles ?? [],
    };

    const created = await this.prisma.userProfile.create({
      data,
      include: userInclude,
    });
    return this.toDto(created);
  }

  async findByUserId(userId: string): Promise<ListUserProfileDto[]> {
    const profiles = await this.prisma.userProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: userInclude,
    });
    return profiles.map((p) => this.toDto(p));
  }

  async findById(profileId: string): Promise<ListUserProfileDto | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: profileId },
      include: userInclude,
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

    const updated = await this.prisma.userProfile.update({
      where: { id: profileId },
      data,
      include: userInclude,
    });
    return this.toDto(updated);
  }

  async delete(profileId: string): Promise<void> {
    await this.prisma.userProfile.delete({ where: { id: profileId } });
  }

  private toDto(profile: any): ListUserProfileDto {
    const u = profile.user ?? {};
    return {
      id: profile.id,
      user_id: profile.userId,
      name: profile.name ?? undefined,
      lastname: profile.lastname ?? undefined,
      skills: profile.skills,
      roles: profile.roles,
      experience_years: u.experienceYears ?? undefined,
      seniority: u.seniority ?? undefined,
      location: u.location ?? undefined,
      department: u.department ?? undefined,
      modality: u.modality ?? [],
      scoreNotification: u.scoreNotification ?? undefined,
      salaryMin: u.salaryMin ?? undefined,
      salaryMax: u.salaryMax ?? undefined,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
      deleted_at: profile.deletedAt,
    };
  }
}
