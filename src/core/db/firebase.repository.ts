import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DocumentData, FieldPath, WhereFilterOp } from 'firebase-admin/firestore';

type WithId<T> = T & { id: string };

type params = {
  field: string | FieldPath,
  op: WhereFilterOp,
  value: unknown
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
    collection: string,
    data: T,
  ): Promise<WithId<T>> {
    const result = await this.db.collection(collection).add(data);
    return { id: result.id, ...data };
  }

  async findAll<T>(collection: string): Promise<T[]> {
    const snapshot = await this.db.collection(collection).get();
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as T,
    );
  }

  async findById<T>(collection: string, id: string): Promise<T> {
    const doc = await this.db.collection(collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as T;
  }

  async findBy<T>(
    collection: string,
    param: params[],
    limit: number = 1,
  ): Promise<T[]> {
    let doc: any = this.db
      .collection(collection)

    if (param.length > 0) {
      param.forEach((p: params) => {
        doc = doc.where(p.field, p.op, p.value);
      });
    }
    doc = await doc.limit(limit)
      .get();
    return doc.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  async update<T extends DocumentData>(
    collection: string,
    id: string,
    data: T,
  ): Promise<WithId<T>> {
    await this.db.collection(collection).doc(id).update(data);
    return { id, ...data };
  }

  async delete(collection: string, id: string) {
    return this.db.collection(collection).doc(id).delete();
  }
}
