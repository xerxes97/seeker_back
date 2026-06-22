import { Injectable } from '@nestjs/common';
import { UserRepository } from '../interfaces/repository';
import { ListUserDto } from '../dto/list-user.dto';
import { PrismaService } from '../../core/db/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CreateUserDto): Promise<ListUserDto> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        scoreAlert: user.scoreAlert ?? 50,
        experienceYears: user.experienceYears ?? null,
        location: user.location ?? null,
        department: user.department ?? null,
        modality: (user.modality as any) ?? [],
        seniority: (user.seniority as any) ?? null,
        scoreNotification: user.scoreNotification ?? null,
        salaryMin: user.salaryMin ?? null,
        salaryMax: user.salaryMax ?? null,
      },
    });
    return this.toDto(created);
  }

  async findById(id: string): Promise<ListUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDto(user);
  }

  async findByEmail(email: string): Promise<ListUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDto(user);
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto | null> {
    const data: any = {};
    if (user.email !== undefined) data.email = user.email;
    if (user.password !== undefined) data.password = user.password;
    if (user.name !== undefined) data.name = user.name;
    if (user.scoreAlert !== undefined) data.scoreAlert = user.scoreAlert;
    if (user.experienceYears !== undefined)
      data.experienceYears = user.experienceYears;
    if (user.location !== undefined) data.location = user.location;
    if (user.department !== undefined) data.department = user.department;
    if (user.modality !== undefined) data.modality = user.modality as any;
    if (user.seniority !== undefined) data.seniority = user.seniority as any;
    if (user.scoreNotification !== undefined)
      data.scoreNotification = user.scoreNotification;
    if (user.salaryMin !== undefined) data.salaryMin = user.salaryMin;
    if (user.salaryMax !== undefined) data.salaryMax = user.salaryMax;

    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.toDto(updated);
  }

  private toDto(user: any): ListUserDto {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name ?? undefined,
      scoreAlert: user.scoreAlert,
      experienceYears: user.experienceYears ?? undefined,
      location: user.location ?? undefined,
      department: user.department ?? undefined,
      modality: user.modality,
      seniority: user.seniority,
      scoreNotification: user.scoreNotification ?? undefined,
      salaryMin: user.salaryMin ?? undefined,
      salaryMax: user.salaryMax ?? undefined,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    } as unknown as ListUserDto;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
