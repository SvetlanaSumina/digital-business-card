import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Profile } from '../generated/prisma/client';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  const repository = { findFirst: jest.fn() };

  beforeEach(async () => {
    repository.findFirst.mockReset();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: ProfileRepository, useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(ProfileService);
  });

  it('returns the profile from the repository', async () => {
    const profile = { id: 1, name: 'Светлана Сумина' } as Profile;
    repository.findFirst.mockResolvedValue(profile);

    await expect(service.getProfile()).resolves.toBe(profile);
  });

  it('throws NotFoundException when there is no profile', async () => {
    repository.findFirst.mockResolvedValue(null);

    await expect(service.getProfile()).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
