import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IUser, IRole, IAuth, ILoginRequest, IRefreshToken } from "../../../Domain/models/interface";
import autoBind from "auto-bind";
import UserValidator from "../../../App/validator/users";
import TokenManager from "../../../Infrastructure/token/manager.token";
import UserRepository from "../../../Infrastructure/repositories/database/user.repository";
import AuthRepository from "../../../Infrastructure/repositories/database/auth.repository";

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
	private _authRepository: AuthRepository;
	private _userRepository: UserRepository;
	private _tokenManager: TokenManager;
	private _validator: typeof UserValidator;

	constructor(
		authRepository: AuthRepository,
		userRepository: UserRepository,
		tokenManager: TokenManager,
		validator: typeof UserValidator
	) {
		autoBind(this);
		this._authRepository = authRepository;
		this._userRepository = userRepository;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start User Handler
	async postUserHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IUser;
		this._validator.validateUserPayload(payload);
		const userId = await this._userRepository.addUser(payload);
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
		const { id: credentialId, role} = request.auth.credentials as unknown as IRole;
		await this._userRepository.editUserById({ id: credentialId, role }, payload);
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: Request, h: ResponseToolkit) {
		const { id: credentialId, role } = request.auth.credentials as unknown as IRole;
		await this._userRepository.deleteUserById({ id: credentialId, role });
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
		const { username, password } = request.payload as ILoginRequest;
		const userId = await this._userRepository.verifyUserCredential({ username, password });
		const accessToken = this._tokenManager.generateAccessToken({ userId });
		const refreshToken = this._tokenManager.generateRefreshToken({ userId });
		await this._authRepository.addUserRefreshToken({ id: userId, token: refreshToken, role: "user" });
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
		this._validator.validatePutUserAuthPayload(request.payload);
		const { refreshToken } = request.payload as IRefreshToken;
		const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authRepository.verifyUserRefreshToken({ id: userId, token: refreshToken });
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
		await this._authRepository.verifyUserRefreshToken({ id: userId, token: refreshToken });
		await this._authRepository.deleteUserRefreshToken({ id: userId, token: refreshToken });
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
