/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

export enum PostStatus {
	Pending = 'PENDING', // Post has not been approved by a moderator and published
	Active = 'ACTIVE', // Post has been approved by a moderator and published
	Localed = 'LOCKED', // Post has been locked by a moderator
	Deleted = 'DELETED', // Post has been deleted by a user or moderator
}
