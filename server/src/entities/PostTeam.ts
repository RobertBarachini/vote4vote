/* eslint-disable import/prefer-default-export */
import { ObjectId } from 'mongodb';
import {
	Entity, PrimaryKey, Property, SerializedPrimaryKey,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class PostTeam {
	@Field(() => String)
	@PrimaryKey({ type: () => ObjectId })
		_id: ObjectId;

	@Field()
	@SerializedPrimaryKey()
		id!: string;

	@Field(() => String)
	@Property({ type: 'date' })
		createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
		updatedAt = new Date();

	@Field()
	@Property({ type: 'text' })
		title!: string;

	@Field(() => String)
	@Property({ type: () => 'text' })
		imageUrl!: string;

	@Field(() => String)
	@Property({ type: () => 'text' })
		color!: string;
}
