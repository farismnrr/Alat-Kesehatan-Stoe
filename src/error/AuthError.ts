import ClientError from "./ClientError";

class AuthenticationError extends ClientError {
	constructor(message: string) {
		super(message, 401);
		this.name = "AuthenticationError";
	}
}

class AuthorizationError extends ClientError {
	constructor(message: string) {
		super(message, 403);
		this.name = "AuthorizationError";
	}
}

export { AuthenticationError, AuthorizationError };
