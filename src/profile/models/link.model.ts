import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Ссылка на профессиональный ресурс' })
export class Link {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Название ресурса, например GitHub' })
  label: string;

  @Field()
  url: string;
}
