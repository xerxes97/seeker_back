import { Injectable } from '@nestjs/common';
import { PostRepository } from '../interfaces/repository';
import { ListPostDto } from '../dto/list-post.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { Collections } from '../../core/constants/collections.enum';

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async create(post: CreatePostDto): Promise<ListPostDto> {
    return await this.firebaseRepository.create({
      collection: Collections.POSTS,
      value: post,
    });
  }

  async findById(id: string): Promise<ListPostDto | null> {
    return await this.firebaseRepository.findById<ListPostDto>(
      Collections.POSTS,
      id,
    );
  }

  async delete(id: string): Promise<void> {
    await this.firebaseRepository.delete({
      collection: Collections.POSTS,
      value: id,
    });
  }
}
