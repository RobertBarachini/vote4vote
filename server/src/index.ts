import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import {
	ApolloServerPluginLandingPageGraphQLPlayground,
	ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
// import redis from 'redis'; // has a broken type definition for client
// import * as Redis from 'ioredis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import mikroConfig from './mikro-orm.config';
import { COOKIE_NAME } from './constants';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
// import IORedis from 'ioredis';
const Redis = require('ioredis');

dotenv.config({ path: process.env.NODE_ENV === 'production' ? 'prod.env' : 'dev.env' });

const PORT = process.env.PORT || 4000;
const PORT_REDIS = process.env.PORT_REDIS || 6379;

const main = async () => {
	// eslint-disable-next-line no-unused-vars
	const orm = await MikroORM.init(mikroConfig);
	// await orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session);
	// const redisClient = new IORedis(); // redis.createClient();
	const redisClient = new Redis({
		host: process.env.REDIS_HOST,
		port: PORT_REDIS,
		password: process.env.REDIS_PASSWORD,
	});
	// Solution to type error:
	// https://github.com/tj/connect-redis/issues/300#issuecomment-580038867
	// const redisClient: IORedis.Cluster = new IORedis.Cluster([]);

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: 'lax', // 'none', // lax', // 'lax', // csrf
				// eslint-disable-next-line max-len
				secure: process.env.NODE_ENV === 'production', // only set secure cookies in production with https
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET ? process.env.SESSION_SECRET : 'idk',
			resave: false,
		}),
	);

	const corsOrigins = [
		'http://localhost:3000',
		// '*',
	];

	if (process.env.NODE_ENV === 'development') {
		corsOrigins.push(process.env.CORS_DEVELOPMENT_ORIGIN!);
		// corsOrigins.push('*');  hm
	}

	console.log(corsOrigins);

	// / TEST
	app.use(
		cors({
			origin: corsOrigins, // 'http://localhost:3000', // corsOrigins,
			credentials: true,
		}),
	);

	// if (process.env.NODE_ENV === 'development') {
	// 	// eslint-disable-next-line global-require
	// 	const cors = require('cors');
	// 	app.use(cors());
	// }

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [
				PostResolver,
				UserResolver,
			],
			validate: false,
		}),
		plugins: [
			process.env.NODE_ENV === 'production'
				? ApolloServerPluginLandingPageDisabled()
				: ApolloServerPluginLandingPageGraphQLPlayground(),
		],
		context: ({ req, res }): MyContext => ({
			em: orm.em,
			req,
			res,
		}),
	});

	await apolloServer.start();

	if (process.env.NODE_ENV === 'development') {
		// app.use(
		// 	'/graphql',
		// 	apolloServer.getMiddleware({
		// 		path: '/graphql',
		// 	}),
		// );
		apolloServer.applyMiddleware({
			app,
			path: '/graphql',
			// cors: {
			// 	credentials: true,
			// 	origin: corsOrigins,
			// },
			cors: false,
		});
	}
	// TEST

	app.listen(PORT, () => {
		console.log(`Environment: '${process.env.NODE_ENV}'`);
		console.log(`Server started on port ${PORT}`);
	});
};

main().catch((err) => {
	console.error(err);
});
