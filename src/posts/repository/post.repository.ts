import { Injectable } from '@nestjs/common';
import { PostRepository } from '../interfaces/repository';
import { ListPostDto } from '../dto/list-post.dto';
import { PrismaService } from '../../core/db/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { Modality, Seniority } from '@prisma/client';

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: CreatePostDto): Promise<ListPostDto> {
    const created = await this.prisma.post.create({
      data: this.toPrismaCreate(post),
    });
    return this.toDto(created);
  }

  async findById(id: string): Promise<ListPostDto | null> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) return null;
    return this.toDto(post);
  }

  async findByExternalId(externalId: string): Promise<ListPostDto | null> {
    const post = await this.prisma.post.findUnique({
      where: { externalId },
    });
    if (!post) return null;
    return this.toDto(post);
  }

  async findByExternalIds(ids: string[]): Promise<ListPostDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { externalId: { in: ids } },
    });
    return posts.map((post) => this.toDto(post));
  }

  async update(
    externalId: string,
    post: Partial<CreatePostDto>,
  ): Promise<ListPostDto> {
    const data = this.toPrismaCreate(post, externalId);
    const existing = await this.prisma.post.findUnique({
      where: { externalId },
    });
    if (existing) {
      const updated = await this.prisma.post.update({
        where: { externalId },
        data,
      });
      return this.toDto(updated);
    } else {
      const created = await this.prisma.post.create({
        data: { ...data, externalId },
      });
      return this.toDto(created);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  private toPrismaCreate(post: Partial<CreatePostDto>, _externalId?: string) {
    return {
      isJob: post.is_job ?? false,
      position: post.position ?? '',
      company: post.company ?? '',
      location: post.location ?? null,
      modality: (post.modality as Modality) ?? null,
      seniority: (post?.seniority as Seniority) ?? null,
      salaryMin: post.salaryMin ?? null,
      salaryMax: post.salaryMax ?? null,
      skills: post.skills ?? [],
      benefits: post.benefits ?? [],
    };
  }

  private toDto(post: any): ListPostDto {
    return {
      id: post.id,
      external_id: post.externalId ?? undefined,
      is_job: post.isJob,
      position: post.position,
      company: post.company ?? undefined,
      location: post.location ?? undefined,
      modality: post.modality,
      seniority: post.seniority,
      salaryMin: post.salaryMin ?? undefined,
      salaryMax: post.salaryMax ?? undefined,
      skills: post.skills,
      benefits: post.benefits,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    };
  }
}
