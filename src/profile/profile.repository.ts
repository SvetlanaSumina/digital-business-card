import { Injectable } from '@nestjs/common';
import type {
  Experience,
  Link,
  Profile,
  Project,
  Skill,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Доступ к данным профиля и связанных сущностей. Batch-методы принимают
// сразу несколько id профилей, чтобы загружать связи для многих профилей
// одним запросом, а не отдельным запросом на каждый профиль.
@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  findFirst(): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ orderBy: { id: 'asc' } });
  }

  findLinksByProfileIds(profileIds: readonly number[]): Promise<Link[]> {
    return this.prisma.link.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findSkillsByProfileIds(profileIds: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findExperienceByProfileIds(
    profileIds: readonly number[],
  ): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { startDate: 'desc' },
    });
  }

  findProjectsByProfileIds(profileIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
