import type {
	IUser,
	ILoginRequest,
	ILoginResponse,
	IRefreshToken
} from "../../Domain/models/interface";
import bcrypt from "bcrypt";
import TokenManager from "../../Infrastructure/token/manager.token";
import UserRepository from "../../Infrastructure/repositories/database/user.repository";
import AuthRepository from "../../Infrastructure/repositories/database/auth.repository";
import { v4 as uuidv4 } from "uuid";
import {
	InvariantError,
	NotFoundError,
	AuthenticationError,
	AuthorizationError
} from "../../Common/errors";

interface IUserService {
	registerUser(payload: IUser): Promise<string>;
	loginUser(payload: ILoginRequest): Promise<ILoginResponse>;
	editUser(payload: IUser): Promise<void>;
	updateToken(payload: IRefreshToken): Promise<string>;
	logoutUser(payload: IRefreshToken): Promise<void>;
	deleteUser(payload: Partial<IUser>): Promise<void>;
}

class UserService implements IUserService {
	private _authRepository: AuthRepository;
	private _userRepository: UserRepository;
	private _tokenManager: TokenManager;

	constructor(
		authRepository: AuthRepository,
		userRepository: UserRepository,
		tokenManager: TokenManager
	) {
		this._authRepository = authRepository;
		this._userRepository = userRepository;
		this._tokenManager = tokenManager;
	}

	async registerUser(payload: IUser): Promise<string> {
		if (!payload.email || !payload.password || !payload.username) {
			throw new InvariantError("Email, password, and username are required");
		}

		const username = await this._userRepository.verifyUsername({ username: payload.username });
		if (username) {
			throw new InvariantError("Username already exists");
		}

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(payload.password, 10);
		const userId = await this._userRepository.addUser({
			...payload,
			id,
			password: hashedPassword
		});
		if (!userId) {
			throw new InvariantError("Failed to register user");
		}
		return userId;
	}

	async loginUser(payload: ILoginRequest): Promise<ILoginResponse> {
		if (!payload.email && !payload.username) {
			throw new InvariantError("Email or username are required");
		}

		const userEmail = (await this._userRepository.verifyEmail(payload)) as unknown as IUser;
		const userUsername = (await this._userRepository.verifyUsername(
			payload
		)) as unknown as IUser;
		if (!userEmail && !userUsername) {
			throw new NotFoundError("User not found");
		}

		const userData = userUsername || userEmail;
		const match = await bcrypt.compare(payload.password || "", userData.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		const accessToken = this._tokenManager.generateAccessToken({ userId: userData.id });
		const refreshToken = this._tokenManager.generateRefreshToken({ userId: userData.id });
		await this._authRepository.addUserRefreshToken({
			id: userData.id,
			token: refreshToken,
			role: "user"
		});

		return { id: userData.id, accessToken, refreshToken };
	}

	async editUser(payload: IUser): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyUserRole({ id: payload.id });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to edit this user");
		}

		await this._userRepository.verifyEmail(payload);
		const hashedPassword = await bcrypt.hash(payload.password, 10);
		await this._userRepository.editUserById({
			...payload,
			password: hashedPassword
		});
	}

	async updateToken(payload: IRefreshToken): Promise<string> {
		const { userId, expiresAt } = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		if (expiresAt < Date.now() / 1000) {
			throw new AuthenticationError("Refresh token has expired!");
		}
		if (!userId) {
			throw new AuthenticationError("Invalid user ID!");
		}

		await this._authRepository.verifyUserRefreshToken({
			id: userId,
			token: payload.refreshToken
		});
		const accessToken = this._tokenManager.generateAccessToken({ userId });
		if (!accessToken) {
			throw new AuthenticationError("Access denied!");
		}
		return accessToken;
	}

	async logoutUser(payload: IRefreshToken): Promise<void> {
		const { userId, expiresAt } = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		if (expiresAt < Date.now() / 1000) {
			throw new AuthenticationError("Refresh token has expired!");
		}
		if (!userId) {
			throw new AuthenticationError("Invalid user ID!");
		}

		await this._authRepository.verifyUserRefreshToken({
			id: userId,
			token: payload.refreshToken
		});
		await this._authRepository.deleteUserRefreshToken({
			id: userId,
			token: payload.refreshToken
		});
	}

	async deleteUser(payload: Partial<IUser>): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyUserRole({ id: payload.id });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to delete this user");
		}

		const userId = await this._userRepository.deleteUserById(payload);
		if (!userId) {
			throw new NotFoundError("User not found");
		}
	}
}

export default UserService;
