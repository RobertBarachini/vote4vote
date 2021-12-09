import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import * as constants from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Post, User],
	dbName: constants.__dbName__,
	type: 'mongo',
	ensureIndexes: true,
	debug: !constants.__prod__,
} as Parameters<typeof MikroORM.init>[0];
