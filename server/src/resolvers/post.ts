import {
	Resolver, Query, Ctx, Arg, Mutation,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from '../types';

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
		@Arg('id', () => String) id: string,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });
		return post;
		// return em.findOne(Post, { id });
	}

	@Mutation(() => Post)
	async createPost(
		@Arg('title', () => String) title: string,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id', () => String) id: string,
		@Arg('title', () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext,
	): Promise<Post | null> {
		const post = await em.findOne(Post, { id });
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
		@Ctx() { em }: MyContext,
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
		em.removeAndFlush(post);
		return true;
	}
}
