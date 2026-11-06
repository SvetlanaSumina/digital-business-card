import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  experienceData,
  linksData,
  profileData,
  projectsData,
  skillsData,
} from './seed-data';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Идемпотентно: профиль ищется по уникальному slug, а связанные данные
// заменяются целиком, поэтому повторный запуск не создаёт дубликатов
// и всегда отражает текущее содержимое seed-data.ts.
async function seed() {
  await prisma.$transaction(async (tx) => {
    const { slug, ...profileFields } = profileData;
    const profile = await tx.profile.upsert({
      where: { slug },
      create: profileData,
      update: profileFields,
    });
    const profileId = profile.id;

    await tx.link.deleteMany({ where: { profileId } });
    await tx.skill.deleteMany({ where: { profileId } });
    await tx.experience.deleteMany({ where: { profileId } });
    await tx.project.deleteMany({ where: { profileId } });

    await tx.link.createMany({
      data: linksData.map((link, sortOrder) => ({
        ...link,
        sortOrder,
        profileId,
      })),
    });
    await tx.skill.createMany({
      data: skillsData.map((name, sortOrder) => ({
        name,
        sortOrder,
        profileId,
      })),
    });
    await tx.experience.createMany({
      data: experienceData.map((item) => ({ ...item, profileId })),
    });
    await tx.project.createMany({
      data: projectsData.map((project, sortOrder) => ({
        ...project,
        sortOrder,
        profileId,
      })),
    });
  });
}

seed()
  .then(() => console.log('Database seeded'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
