import { Module } from '@nestjs/common';
import { ProfileLoadersFactory } from './profile.loaders';
import { ProfileRepository } from './profile.repository';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  providers: [
    ProfileRepository,
    ProfileService,
    ProfileResolver,
    ProfileLoadersFactory,
  ],
  exports: [ProfileLoadersFactory],
})
export class ProfileModule {}
