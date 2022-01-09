/* eslint-disable import/prefer-default-export */
import { ObjectId } from 'mongodb';
import {
	Entity, Enum, PrimaryKey, Property, SerializedPrimaryKey,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { PostStatus } from '../enums/post';
import { PostTeam } from './PostTeam';

@ObjectType()
@Entity()
export class Post {
	@Field(() => String)
	@PrimaryKey({ type: () => ObjectId })
		_id: ObjectId;

	@Field()
	@SerializedPrimaryKey()
		id!: string; // won't be saved in the database

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
	@Enum(() => PostStatus)
		status = PostStatus.Pending;

	@Field(() => String)
	@Property({ type: () => ObjectId })
		authorId!: ObjectId;

	@Field(() => String)
	@Property({ type: () => ObjectId })
		approvedBy!: ObjectId;

	@Field(() => String)
	@Property({ type: () => ObjectId })
		statusChangedBy!: ObjectId;

	@Field(() => String)
	@Property({ type: () => 'text' })
		playingFieldText!: string;

	@Field(() => Number)
	@Property({ type: () => Number })
		playingFieldSize!: number;

	@Field(() => [PostTeam])
	@Property({ type: () => [PostTeam] })
		teams: PostTeam[];

	@Field(() => Number)
	@Property({ type: () => Number })
		numberOfTeams!: number;
}
