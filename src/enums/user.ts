/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

export enum UserRole {
	Admin = 'ADMIN', // Highest role
	Moderator = 'MODERATOR', // Moderator role
	User = 'USER', // Standard role
}

export enum UserStatus {
	Pending = 'PENDING', // User has not confirmed their email address
	Active = 'ACTIVE', // User has confirmed their email address
	Deactivated = 'DEACTIVATED', // User has deactivated their account
	Suspended = 'SUSPENDED', // User has been suspended
	Banned = 'BANNED', // User has been banned
}
