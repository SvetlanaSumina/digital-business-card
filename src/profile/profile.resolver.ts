import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Experience } from './models/experience.model';
import { Link } from './models/link.model';
import { Profile } from './models/profile.model';
import { Project } from './models/project.model';
import { Skill } from './models/skill.model';
import type { ProfileLoaders } from './profile.loaders';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { description: 'Профиль владельца визитки' })
  profile() {
    return this.profileService.getProfile();
  }

  // Связанные данные загружаются, только если клиент запросил поле,
  // и батчатся через DataLoader'ы, создаваемые на каждый запрос.

  @ResolveField(() => [Link])
  links(
    @Parent() profile: Profile,
    @Context('loaders') loaders: ProfileLoaders,
  ) {
    return loaders.links.load(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(
    @Parent() profile: Profile,
    @Context('loaders') loaders: ProfileLoaders,
  ) {
    return loaders.skills.load(profile.id);
  }

  @ResolveField(() => [Experience], {
    description: 'Опыт работы, от последнего места к первому',
  })
  experience(
    @Parent() profile: Profile,
    @Context('loaders') loaders: ProfileLoaders,
  ) {
    return loaders.experience.load(profile.id);
  }

  @ResolveField(() => [Project])
  projects(
    @Parent() profile: Profile,
    @Context('loaders') loaders: ProfileLoaders,
  ) {
    return loaders.projects.load(profile.id);
  }
}
