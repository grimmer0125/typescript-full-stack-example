import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  // @Field({ nullable: true })
  // @Column()
  // firstName?: string;

  // @Field({ nullable: true })
  // @Column()
  // lastName?: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  password: string;
}
