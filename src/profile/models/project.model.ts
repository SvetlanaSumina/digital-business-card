import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Проект' })
export class Project {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ description: 'Ссылка на проект или репозиторий' })
  url: string;
}
