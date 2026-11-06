import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Профиль специалиста' })
export class Profile {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ description: 'Краткое описание' })
  description: string;
}
