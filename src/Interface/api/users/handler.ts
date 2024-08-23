import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IUser, IUserAuth } from "../../../Common/models/interface";
import autoBind from "auto-bind";
import UserValidator from "../../../App/validator/users";
import UserService from "../../../App/service/user.service";
import TokenManager from "../../../Infrastructure/token/manager.token";

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
	private _tokenManager: TokenManager;
	private _userService: UserService;
	private _validator: typeof UserValidator;

	constructor(
		tokenManager: TokenManager,
		userService: UserService,
		validator: typeof UserValidator
	) {
		autoBind(this);
		this._tokenManager = tokenManager;
		this._userService = userService;
		this._validator = validator;
	}

	// Start User Handler
	async postUserHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IUser;
		this._validator.validateUserPayload(payload);
		const userId = await this._userService.registerUser(payload);
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
		this._validator.validatePostUserAuthPayload(payload);
		const { id } = request.auth.credentials as unknown as IUser;
		await this._userService.editUser({ ...payload, id });
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.auth.credentials as unknown as IUser;
		await this._userService.deleteUser({ id });
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
		const payload = request.payload as IUserAuth;
		this._validator.validatePostUserAuthPayload(payload);
		const userId = await this._userService.loginUser(payload);
		const accessToken = this._tokenManager.generateAccessToken({ id: userId });
		const refreshToken = this._tokenManager.generateRefreshToken({ id: userId });
		await this._userService.addUserAuth({ id: userId, refreshToken });
		return h
			.response({
				status: "success",
				message: "User logged in successfully",
				data: {
					userId,
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putUserAuthHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IUserAuth;
		this._validator.validatePutUserAuthPayload(payload);
		const userId = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		await this._userService.editToken({
			id: userId,
			refreshToken: payload.refreshToken
		});
		const accessToken = this._tokenManager.generateAccessToken({ id: userId });
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
		const payload = request.payload as IUserAuth;
		this._validator.validateDeleteUserAuthPayload(payload);
		const userId = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		await this._userService.logoutUser({
			id: userId,
			refreshToken: payload.refreshToken
		});
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
