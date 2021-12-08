// Validate an email address according to RFC 5322
export const validateEmail = (email: string): boolean => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
};

// Validate an email address according to RTC 6854
export const validateEmailRtc6854 = (email: string): boolean => {
	const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return re.test(String(email).toLowerCase());
};

// Validate a password according to the password policy without using regular expressions
export const validatePassword = (password: string): boolean => {
	const minLength = 8;
	const maxLength = 72;
	if (password.length < minLength || password.length > maxLength) {
		return false;
	}
	if (password.search(/[a-z]/) < 0) {
		return false;
	}
	if (password.search(/[A-Z]/) < 0) {
		return false;
	}
	if (password.search(/[0-9]/) < 0) {
		return false;
	}
	// if (password.search(/[^a-zA-Z0-9]/) >= 0) {
	// 	return false;
	// }
	return true;
};

// Validate username according to the username policy without using regular expressions
export const validateUsername = (username: string): boolean => {
	const minLength = 2;
	const maxLength = 30;
	if (username.length < minLength || username.length > maxLength || username.includes('@')) {
		return false;
	}
	// if (username.search(/[^a-zA-Z0-9_]/) >= 0) {
	// 	return false;
	// }
	return true;
};

// export class Validation {
// 	public static async validateEmail(email: string): Promise<boolean> {
// 		return validateEmail(email);
// 	}

// 	public static validateEmailRtc6854(email: string): boolean {
// 		return validateEmailRtc6854(email);
// 	}

// 	public static validatePassword(password: string): boolean {
// 		return validatePassword(password);
// 	}

// 	public static validateUsername(username: string): boolean {
// 		return validateUsername(username);
// 	}
// }

// module.exports = Validation;

// module.exports = {
// 	validateEmail,
// 	validateEmailRtc6854,
// 	validatePassword,
// 	validateUsername,
// };

// module.exports = validateEmail;
