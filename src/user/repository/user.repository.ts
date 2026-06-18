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
      },
    });
    return { id: created.id, ...user, scoreAlert: user.scoreAlert ?? 50 } as ListUserDto;
  }

  async findById(id: string): Promise<ListUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name ?? undefined,
      scoreAlert: user.scoreAlert,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    } as unknown as ListUserDto;
  }

  async findByEmail(email: string): Promise<ListUserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name ?? undefined,
      scoreAlert: user.scoreAlert,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    } as unknown as ListUserDto;
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto | null> {
    const data: any = {};
    if (user.email !== undefined) data.email = user.email;
    if (user.password !== undefined) data.password = user.password;
    if (user.name !== undefined) data.name = user.name;
    if (user.scoreAlert !== undefined) data.scoreAlert = user.scoreAlert;

    const updated = await this.prisma.user.update({ where: { id }, data });
    return {
      id: updated.id,
      email: updated.email,
      password: updated.password,
      name: updated.name ?? undefined,
      scoreAlert: updated.scoreAlert,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    } as unknown as ListUserDto;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
