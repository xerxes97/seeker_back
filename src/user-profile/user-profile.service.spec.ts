import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileService } from './user-profile.service';
import * as admin from 'firebase-admin';
import { Seniority } from './dto/create-user-profile.dto';

jest.mock('firebase-admin', () => {
  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: () => mockFirestore,
    credential: {
      applicationDefault: jest.fn(),
    },
  };
});

describe('UserProfileService', () => {
  let service: UserProfileService;
  let mockDb: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserProfileService],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    mockDb = admin.firestore();
  });

  it('should normalize skills correctly', async () => {
    const dto = {
      user_id: 'test-uuid',
      skills: ['JS', 'js', 'Node', 'Node.js', 'REACT'],
      roles: ['Backend Developer'],
      experience_years: 3,
      seniority: 'mid' as Seniority
      ,
    };

    mockDb.doc.mockReturnValue({
      set: jest.fn(),
      get: jest.fn().mockResolvedValue({
        data: () => ({ ...dto, skills: ['javascript', 'node.js', 'react'] }),
      }),
    });

    const result = await service.createProfile('test-uuid', dto);
    expect(result.skills).toContain('javascript');
    expect(result.skills).toContain('node.js');
    expect(result.skills).toContain('react');
  });
});
