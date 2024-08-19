import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IUser, IRole, IAuth, ILogin, IRefreshToken } from "../../../Domain/models";
import autoBind from "auto-bind";
import UserService from "../../../Infrastructure/repositories/database/user.service";
import AuthService from "../../../Infrastructure/repositories/database/auth.service";
import TokenManager from "../../../Infrastructure/token/manager.token";
import UserValidator from "../../../App/validator/users";

interface IUserHandler {
	// Start User Handler
	postUserHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	updateUserHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	deleteUserHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	// End User Handler

	// Start User Auth Handler
	postUserAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	putUserAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	deleteUserAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	// End User Auth Handler
}

class UserHandler implements IUserHandler {
	private _authService: AuthService;
	private _userService: UserService;
	private _tokenManager: TokenManager;
	private _validator: typeof UserValidator;

	constructor(
		authService: AuthService,
		userService: UserService,
		tokenManager: TokenManager,
		validator: typeof UserValidator
	) {
		autoBind(this);
		this._authService = authService;
		this._userService = userService;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start User Handler
	async postUserHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IUser;
		this._validator.validateUserPayload(payload);
		const userId = await this._userService.addUser(payload);
		return h
			.response({
				status: "success",
				message: "User added successfully",
				data: {
					userId
				}
			})
			.code(201);
	}

	async updateUserHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IUser;
		this._validator.validateUserPayload(payload);
		const { id: credentialId, role } = request.auth.credentials as unknown as IRole;
		await this._userService.editUserById({ id: credentialId, role }, payload);
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: Request, h: ResponseToolkit) {
		const { id: credentialId, role } = request.auth.credentials as unknown as IRole;
		await this._userService.deleteUserById({ id: credentialId, role });
		return h
			.response({
				status: "success",
				message: "User deleted successfully"
			})
			.code(200);
	}
	// End User Handler

	// Start User Auth Handler
	async postUserAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validatePostUserAuthPayload(request.payload);
		const { username, password } = request.payload as ILogin;
		const userId = await this._userService.verifyUserCredential({ username, password });
		const accessToken = this._tokenManager.generateAccessToken({ userId });
		const refreshToken = this._tokenManager.generateRefreshToken({ userId });
		await this._authService.addUserRefreshToken({ id: userId, token: refreshToken });
		return h
			.response({
				status: "success",
				message: "User logged in successfully",
				data: {
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putUserAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validatePutUserAuthPayload(request.payload);
		const { refreshToken } = request.payload as IRefreshToken;
		const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authService.verifyUserRefreshToken({ id: userId, token: refreshToken });
		const accessToken = this._tokenManager.generateAccessToken({ userId });
		return h
			.response({
				status: "success",
				message: "Access token refreshed successfully",
				data: {
					accessToken
				}
			})
			.code(200);
	}

	async deleteUserAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateDeleteUserAuthPayload(request.payload);
		const { refreshToken } = request.payload as IRefreshToken;
		const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authService.verifyUserRefreshToken({ id: userId, token: refreshToken });
		await this._authService.deleteUserRefreshToken({ id: userId, token: refreshToken });
		return h
			.response({
				status: "success",
				message: "Refresh token deleted successfully"
			})
			.code(200);
	}
	// End User Auth Handler
}

export default UserHandler;
