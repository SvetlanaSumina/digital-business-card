import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import type {
  Experience,
  Link,
  Project,
  Skill,
} from '../generated/prisma/client';
import { ProfileRepository } from './profile.repository';

export interface ProfileLoaders {
  links: DataLoader<number, Link[]>;
  skills: DataLoader<number, Skill[]>;
  experience: DataLoader<number, Experience[]>;
  projects: DataLoader<number, Project[]>;
}

// DataLoader собирает все вызовы `load(profileId)` в рамках одного
// GraphQL-запроса и превращает их в один запрос `WHERE profile_id IN (...)`
// на каждую связь, поэтому вложенные поля не вызывают проблему N+1.
// DataLoader кеширует результаты, поэтому на каждый запрос нужен новый набор.
@Injectable()
export class ProfileLoadersFactory {
  constructor(private readonly profileRepository: ProfileRepository) {}

  create(): ProfileLoaders {
    return {
      links: this.createLoader((ids) =>
        this.profileRepository.findLinksByProfileIds(ids),
      ),
      skills: this.createLoader((ids) =>
        this.profileRepository.findSkillsByProfileIds(ids),
      ),
      experience: this.createLoader((ids) =>
        this.profileRepository.findExperienceByProfileIds(ids),
      ),
      projects: this.createLoader((ids) =>
        this.profileRepository.findProjectsByProfileIds(ids),
      ),
    };
  }

  private createLoader<T extends { profileId: number }>(
    fetch: (profileIds: readonly number[]) => Promise<T[]>,
  ): DataLoader<number, T[]> {
    return new DataLoader(async (profileIds) => {
      const rows = await fetch(profileIds);
      // DataLoader ожидает результаты в том же порядке, что и ключи;
      // группировка сохраняет сортировку из репозитория внутри профиля.
      const byProfileId = Map.groupBy(rows, (row) => row.profileId);
      return profileIds.map((id) => byProfileId.get(id) ?? []);
    });
  }
}
