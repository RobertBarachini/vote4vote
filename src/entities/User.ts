/* eslint-disable import/prefer-default-export */
import { ObjectId } from 'mongodb';
import {
	Entity, Enum, PrimaryKey, Property, SerializedPrimaryKey, Unique,
} from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { UserRole, UserStatus } from '../enums/user';

@ObjectType()
@Entity()
export class User {
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
	@Unique()
	@Property({ type: 'text' })
		username!: string;
	// @Field()
	// @Property({ type: 'text', unique: true })
	// 	username!: string;

	@Field()
	@Unique()
	@Property({ type: 'text' })
		email!: string;

	// @Field() // won't be exposed in the GraphQL schema
	@Property({ type: 'text' })
		password!: string;

	// @Field(() => UserRole)
	@Enum(() => UserRole)
		role = UserRole.User; // : UserRole;

	// @Field(() => UserStatus)
	@Enum(() => UserStatus)
		status = UserStatus.Pending; // : UserStatus;
}
