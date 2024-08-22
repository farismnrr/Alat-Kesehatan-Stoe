import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IUser, ILoginRequest, IRefreshToken } from "../../../Domain/models/interface";
import autoBind from "auto-bind";
import UserValidator from "../../../App/validator/users";
import UserService from "../../../App/service/user.service";

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
	private _userService: UserService;
	private _validator: typeof UserValidator;

	constructor(userService: UserService, validator: typeof UserValidator) {
		autoBind(this);
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
		this._validator.validateUserPayload(payload);
		const { id: credentialId } = request.auth.credentials as unknown as IUser;
		await this._userService.editUser({ ...payload, id: credentialId });
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: Request, h: ResponseToolkit) {
		const { id: credentialId } = request.auth.credentials as unknown as IUser;
		await this._userService.deleteUser({ id: credentialId });
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
		const payload = request.payload as ILoginRequest;
		this._validator.validatePostUserAuthPayload(payload);
		const {
			id: userId,
			accessToken,
			refreshToken
		} = await this._userService.loginUser(payload);
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
		const payload = request.payload as IRefreshToken;
		this._validator.validatePutUserAuthPayload(payload);
		const accessToken = await this._userService.updateToken(payload);
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
		const payload = request.payload as IRefreshToken;
		this._validator.validateDeleteUserAuthPayload(payload);
		await this._userService.logoutUser(payload);
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
