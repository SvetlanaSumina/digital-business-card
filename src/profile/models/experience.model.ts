import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Место работы' })
export class Experience {
  @Field(() => ID)
  id: number;

  @Field()
  company: string;

  @Field()
  position: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Пусто, если это текущее место работы',
  })
  endDate: Date | null;

  @Field(() => [String])
  achievements: string[];
}
