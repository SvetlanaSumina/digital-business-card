import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Навык' })
export class Skill {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}
