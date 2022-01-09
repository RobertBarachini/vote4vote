/* eslint-disable max-classes-per-file */
import { ObjectId } from '@mikro-orm/mongodb';
import {
	Resolver, Query, Ctx, Arg, Mutation, InputType, Field, ObjectType,
} from 'type-graphql';
import { PostTeam } from '../entities/PostTeam';
import { Post } from '../entities/Post';
import { MyContext } from '../types';

@InputType()
class PostUpdatePlayingFieldInput {
	@Field()
		id!: string;

	@Field()
		elementsClicked!: string;
}

@InputType()
class PostCreateInput {
	@Field()
		title!: string;

	// @Field(() => [PostTeam])
	// TODO how to use complex object types with input args
	@Field()
		teamsArg!: string;
		// postTeams!: PostTeam[];

	@Field()
		playingFieldSize!: number;
}

@Resolver()
export class PostResolver {
	@Query(() => [Post])
	async posts(
		@Ctx() { em }: MyContext,
	): Promise<Post[]> {
		const posts = await em.find(Post, {});
		// not a single line return for debugging purposes
		return posts;
		// return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true })
	async post(
		@Arg('id', () => String) id: ObjectId,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { _id: new ObjectId(id) });
		console.log('Post: ', post);
		return post;
		// return em.findOne(Post, { id });
	}

	@Mutation(() => Post, { nullable: true })
	async createPost(
		// @Arg('title', () => String) title: string,
		// @Arg('playingFieldSize', () => Number) playingFieldSize: number,
		// @Arg('teams', () => [PostTeam]) teams: object,
		@Arg('options', () => PostCreateInput) options: PostCreateInput,
		@Ctx() { em, req }: MyContext,
	): Promise<Post | null> {
		console.log('options: ', options);
		// TODO return prettier error object
		// TODO check every PostTeam object for valid data
		const teams:any = JSON.parse(options.teamsArg);
		// const teams:[PostTeam] = (JSON.parse(options.teamsArg))?.teams;
		const errors = [];
		// Check all conditions
		if (teams.length < 2
			|| teams.length > 8
			|| options.title.length < 1
			|| options.title.length > 200
			|| options.playingFieldSize < 100
			|| options.playingFieldSize > 900 // 1600
			|| req?.session?.userId === undefined) {
			console.log('Error: ', 'Invalid data for creating a post');
			errors.push('Invalid data for creating a post');
			return null;
		}
		teams.forEach((team: PostTeam) => {
			// eslint-disable-next-line no-param-reassign
			team._id = new ObjectId();
			if (team.title.length < 1
				|| team.title.length > 100) {
				// TODO check if imageUrl is a valid url
				// TODO check if color is a valid hex color
				console.log('Error: ', 'Invalid data in teams for creating a post');
				errors.push('Invalid data in teams for creating a post');
			}
		});

		// create a text of size 50 with all characters set to '-'
		const post = em.create(Post, {
			title: options.title,
			teams: teams as PostTeam[],
			playingFieldText: ' '.repeat(options.playingFieldSize),
			authorId: req.session.userId,
		});
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id', () => String) id: ObjectId,
		@Arg('title', () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { _id: new ObjectId(id) });
		if (!post) {
			return null;
		}
		if (typeof title !== 'undefined') {
			post.title = title;
			await em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id', () => String) id: string,
		@Ctx() { em, req }: MyContext,
	): Promise<boolean> {
		// try {
		// 	await em.nativeDelete(Post, { id });
		// 	return true;
		// } catch (err) {
		// 	return false;
		// }
		const post = await em.findOne(Post, { id });
		if (!post) {
			return false;
		}
		// Check if user is the author of the post
		// TODO - check if user role is appropriate even if the user is the author
		if (post.authorId !== req.session.userId) {
			return false;
		}
		em.removeAndFlush(post);
		return true;
	}

	// @Arg('id', () => String) id: ObjectId,
	// @Arg('elementsClicked', () => String, { nullable: true }) elementsClicked: string,
	// @Arg('elementsClicked', () => [Object], { nullable: true }) elementsClicked: object[],
	@Mutation(() => Post, { nullable: true })
	async updatePlayingField(
		@Arg('options', () => PostUpdatePlayingFieldInput) options: PostUpdatePlayingFieldInput,
		@Ctx() { em, req }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { _id: new ObjectId(options.id) });
		if (!post) {
			return null;
		}
		const elementsClickedParsed = JSON.parse(options.elementsClicked);
		if (typeof elementsClickedParsed !== 'undefined' && elementsClickedParsed.length > 0) {
			const playingFieldArr = post.playingFieldText.split('');
			elementsClickedParsed.forEach((el: any) => {
				playingFieldArr[el.index] = el.color;
			});
			post.playingFieldText = playingFieldArr.join('');
			await em.persistAndFlush(post);
		}
		// TODO - add server time to the response in order to only accept the latest field update
		// eslint-disable-next-line max-len
		// reponse - the client should store the latest response time and only accept the latest response
		// (prevent flickering)
		return post;
	}
}
