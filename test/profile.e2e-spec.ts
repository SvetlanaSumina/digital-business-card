import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Работает с базой из DATABASE_URL, к которой применены миграции и seed
// (`docker compose up -d db && npm run prisma:deploy && npm run prisma:seed`).
describe('Profile GraphQL API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const graphql = (query: string) =>
    request(app.getHttpServer()).post('/graphql').send({ query });

  it('returns the profile with all related data', async () => {
    const response = await graphql(`
      query {
        profile {
          name
          description
          links {
            label
            url
          }
          skills {
            name
          }
          experience {
            company
            position
            startDate
            endDate
            achievements
          }
          projects {
            name
            url
          }
        }
      }
    `).expect(200);

    expect(response.body.errors).toBeUndefined();
    const { profile } = response.body.data;
    expect(profile.name).toEqual(expect.any(String));
    expect(profile.links.length).toBeGreaterThan(0);
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.experience.length).toBeGreaterThan(0);
    expect(profile.projects.length).toBeGreaterThan(0);
  });

  it('orders experience from the most recent job', async () => {
    const response = await graphql(
      '{ profile { experience { startDate } } }',
    ).expect(200);

    const dates: string[] = response.body.data.profile.experience.map(
      (job: { startDate: string }) => job.startDate,
    );
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('rejects unknown fields', async () => {
    const response = await graphql('{ profile { salary } }').expect(400);

    expect(response.body.errors[0].extensions.code).toBe(
      'GRAPHQL_VALIDATION_FAILED',
    );
  });
});
