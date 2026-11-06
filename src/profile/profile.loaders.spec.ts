import { Test } from '@nestjs/testing';
import { ProfileLoadersFactory } from './profile.loaders';
import { ProfileRepository } from './profile.repository';

describe('ProfileLoadersFactory', () => {
  let factory: ProfileLoadersFactory;
  const repository = {
    findLinksByProfileIds: jest.fn(),
    findSkillsByProfileIds: jest.fn(),
    findExperienceByProfileIds: jest.fn(),
    findProjectsByProfileIds: jest.fn(),
  };

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset());
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileLoadersFactory,
        { provide: ProfileRepository, useValue: repository },
      ],
    }).compile();
    factory = moduleRef.get(ProfileLoadersFactory);
  });

  it('batches loads for several profiles into one repository call', async () => {
    repository.findSkillsByProfileIds.mockResolvedValue([
      { id: 1, profileId: 1, name: 'TypeScript' },
      { id: 2, profileId: 2, name: 'GraphQL' },
      { id: 3, profileId: 1, name: 'NestJS' },
    ]);
    const { skills } = factory.create();

    const [first, second] = await Promise.all([skills.load(1), skills.load(2)]);

    expect(repository.findSkillsByProfileIds).toHaveBeenCalledTimes(1);
    expect(repository.findSkillsByProfileIds).toHaveBeenCalledWith([1, 2]);
    expect(first.map((skill) => skill.name)).toEqual(['TypeScript', 'NestJS']);
    expect(second.map((skill) => skill.name)).toEqual(['GraphQL']);
  });

  it('returns an empty list for a profile without related rows', async () => {
    repository.findProjectsByProfileIds.mockResolvedValue([]);
    const { projects } = factory.create();

    await expect(projects.load(42)).resolves.toEqual([]);
  });

  it('creates independent loaders so caches are not shared between requests', async () => {
    repository.findLinksByProfileIds.mockResolvedValue([]);

    await factory.create().links.load(1);
    await factory.create().links.load(1);

    expect(repository.findLinksByProfileIds).toHaveBeenCalledTimes(2);
  });
});
