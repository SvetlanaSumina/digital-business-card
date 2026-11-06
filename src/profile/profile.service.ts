import { Injectable, NotFoundException } from '@nestjs/common';
import type { Profile } from '../generated/prisma/client';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileRepository.findFirst();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
