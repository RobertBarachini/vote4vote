/* eslint-disable no-shadow */
import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { Request, Response } from 'express';
// import { Session } from 'express-session';

// Solves 'Property 'userId' does not exist on type 'Session & Partial<SessionData>'.ts(2339)'
// declare module 'express-session' {
// 	// eslint-disable-next-line no-unused-vars
// 	interface Session {
// 		userId: string;
// 	}
// }

export type MyContext = {
 em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
//  req: Request & { session: Session };
 req: Request & { session: any };
 res: Response;
};
