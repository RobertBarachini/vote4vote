/* eslint-disable no-new */
/* eslint-disable no-promise-executor-return */
/* eslint-disable max-classes-per-file */
import {
	Resolver, Arg, Mutation, Ctx, Field, InputType, ObjectType, Query,
} from 'type-graphql';
import argon2 from 'argon2';
import { ObjectId } from 'mongodb';
import { COOKIE_NAME } from '../constants';
import { MyContext } from '../types';
import { User } from '../entities/User';
// import { Validation } from '../utils/validation';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';

@InputType()
class UserInputLogin {
	@Field()
		username: string;

	@Field()
		password: string;
}

@InputType()
class UserInputRegister {
	@Field()
		username: string;

	@Field()
		password: string;

	@Field()
		email: string;
}

@ObjectType()
class FieldError {
	@Field()
		field: string;

	@Field()
		message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
		errors?: FieldError[];

	@Field(() => User, { nullable: true })
		user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
		if (!req.session.userId) {
			return null;
		}
		const user = await em.findOne(User, { _id: new ObjectId(req.session.userId) });
		return user;
	}

	@Mutation(() => UserResponse, { nullable: true })
	async register(
		@Arg('options', () => UserInputRegister) options: UserInputRegister,
		@Ctx() { em, req }: MyContext,
	): Promise<UserResponse> {
		console.log(options);
		const errors: FieldError[] = [];
		if (!validateEmail(options.email)) {
			errors.push({
				field: 'email',
				message: 'Invalid email',
			});
		}
		if (!validateUsername(options.username)) {
			errors.push({
				field: 'username',
				message: 'Invalid username',
			});
		}
		if (!validatePassword(options.password)) {
			errors.push({
				field: 'password',
				message: 'Invalid password',
			});
		}
		if (errors.length > 0) {
			return {
				errors,
			};
		}
		const hashedPassword = await argon2.hash(options.password);
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
			email: options.email,
		});
		try {
			await em.persistAndFlush(user);
			req.session.userId = user.id;
			return {
				user,
			};
		} catch (err) { // UniqueConstraintViolationException: E11000 duplicate key error collection
			if (err.code === 11000) {
				if ('username' in err.keyValue) {
					errors.push({
						field: 'username',
						message: 'Username already taken',
					});
				}
				if ('email' in err.keyValue) {
					errors.push({
						field: 'email',
						message: 'Email already in use',
					});
				}
			} else {
				errors.push({
					field: 'other',
					message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
					// message: err.message,
				});
			}
			return {
				errors,
				// errors: [{
				// 	field: 'username',
				// 	message: 'Username or email already taken',
				// }],
			};
		}
	}

	@Mutation(() => UserResponse, { nullable: true })
	async login(
		@Arg('options', () => UserInputLogin) options: UserInputLogin,
		@Ctx() { em, req }: MyContext,
	): Promise<UserResponse> {
		let user = null;
		if (options.username.includes('@')) {
			user = await em.findOne(User, { email: options.username });
		} else {
			user = await em.findOne(User, { username: options.username });
		}
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: 'Username does not exist',
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, options.password);
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'Incorrect password',
					},
				],
			};
		}
		req.session.userId = user.id; // sets a cookie on the client
		return {
			user,
		};
	}

	@Mutation(() => Boolean)
	async logout(
		@Ctx() { req, res }: MyContext,
	): Promise<Boolean> {
		return new Promise((resolve) => req.session.destroy((err: any) => {
			res.clearCookie(COOKIE_NAME);
			if (err) {
				console.log(err);
				resolve(false);
				return;
			}
			resolve(true);
		}));
	}
}
