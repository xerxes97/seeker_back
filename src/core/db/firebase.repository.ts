import { Inject, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import * as admin from 'firebase-admin';
import {
  DocumentData,
  FieldPath,
  WhereFilterOp,
} from 'firebase-admin/firestore';
import { CollectionType } from '../constants/collections.enum';

type WithId<T> = T & { id: string };

type params = {
  field: string | FieldPath;
  op: WhereFilterOp;
  value: unknown;
};

interface ICollectionQuery {
  collection: CollectionType;
  value?: any;
}

@Injectable()
export class FirebaseRepository {
  private readonly db: admin.firestore.Firestore;

  constructor(
    @Inject('FIREBASE_DB') private readonly firebaseApp: admin.app.App,
  ) {
    this.db = this.firebaseApp.firestore();
  }

  collection(name: string) {
    return this.db.collection(name);
  }

  async create<T extends DocumentData>(
    ...args: ICollectionQuery[]
  ): Promise<WithId<T>> {
    const last = args.at(-1)!;
    const plain = instanceToPlain(last.value);
    let query: any = this.db;

    for (let i = 0; i < args.length - 1; i++) {
      const current = args[i];
      query = query.collection(current.collection).doc(current.value);
    }

    const result = await query.collection(last.collection).add(last.value);

    return { id: result.id, ...plain } as WithId<T>;
  }

  async findAll<T>(collection: string, param?: params[]): Promise<T[]> {
    let query: any = this.db.collection(collection);
    if (param && param.length > 0) {
      param.forEach((p: params) => {
        query = query.where(p.field, p.op, p.value);
      });
    }
    const result = await query.get();
    return result.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as T,
    );
  }

  async findById<T>(collection: CollectionType, id: string): Promise<T> {
    const result = await this.db.collection(collection).doc(id).get();
    return { id: result.id, ...result.data() } as T;
  }

  async findBy<T>(
    param?: params[],
    limit: number = 1,
    ...args: { collection: CollectionType; value?: string }[]
  ): Promise<T[]> {
    let query: any = this.db;
    const last = args.at(-1)!;

    for (let i = 0; i < args.length - 1; i++) {
      const current = args[i];
      query = query.collection(current.collection).doc(current.value);
    }

    query = query.collection(last.collection);

    if (param && param.length > 0) {
      param.forEach((p: params) => {
        query = query.where(p.field, p.op, p.value);
      });
    }

    query = await query.limit(limit).get();
    return query.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  async update<T extends DocumentData>(
    data: T,
    ...args: ICollectionQuery[]
  ): Promise<WithId<T>> {
    let query: any = this.db;
    const plain = instanceToPlain(data);

    for (let i = 0; i < args.length - 1; i++) {
      query = query.collection(args[i].collection).doc(args[i].value);
    }

    const last = args.at(-1)!;
    await query.collection(last.collection).doc(last.value).update(plain);
    return { id: last.value, ...plain } as WithId<T>;
  }

  async delete(
    ...args: { collection: CollectionType; value: string }[]
  ): Promise<void> {
    let query: any = this.db;

    for (let i = 0; i < args.length - 1; i++) {
      query = query.collection(args[i].collection).doc(args[i].value);
    }

    const last = args.at(-1)!;
    return query.collection(last.collection).doc(last.value).delete();
  }
}
