import type { IUser, IUserAuth } from "../../Common/models/types";
import bcrypt from "bcrypt";
import UserRepository from "../../Infrastructure/repositories/database/user.repository";
import AuthRepository from "../../Infrastructure/repositories/database/auth.repository";
import { v7 as uuidv7 } from "uuid";
import {
	InvariantError,
	NotFoundError,
	AuthenticationError,
	AuthorizationError
} from "../../Common/errors";

interface IUserService {
	registerUser(payload: IUser): Promise<string>;
	loginUser(payload: Partial<IUserAuth>): Promise<string>;
	addUserAuth(payload: Partial<IUserAuth>): Promise<void>;
	getUserToken(payload: Partial<IUserAuth>): Promise<void>;
	editUser(payload: IUser): Promise<void>;
	editUserToken(payload: Partial<IUserAuth>): Promise<void>;
	logoutUser(payload: Partial<IUserAuth>): Promise<void>;
	deleteUser(payload: Partial<IUser>): Promise<void>;
}

class UserService implements IUserService {
	private _authRepository: AuthRepository;
	private _userRepository: UserRepository;

	constructor(authRepository: AuthRepository, userRepository: UserRepository) {
		this._authRepository = authRepository;
		this._userRepository = userRepository;
	}

	async registerUser(payload: IUser): Promise<string> {
		if (!payload.email || !payload.password || !payload.username) {
			throw new InvariantError("Email, password, and username are required");
		}

		const username = await this._userRepository.verifyUsername({ username: payload.username });
		if (username) {
			throw new InvariantError("Username already exists");
		}

		const id = uuidv7();
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

	async loginUser(payload: Partial<IUserAuth>): Promise<string> {
		if (!payload.email && !payload.username) {
			throw new InvariantError("Email or username are required");
		}

		let userData: IUser | null = null;
		if (payload.email) {
			userData = await this._userRepository.verifyEmail({ email: payload.email });
		}
		if (payload.username) {
			userData = await this._userRepository.verifyUsername({ username: payload.username });
		}
		if (!userData) {
			throw new NotFoundError("User not found");
		}

		const isValidPassword = await bcrypt.compare(payload.password || "", userData.password);
		if (!isValidPassword) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return userData.id;
	}

	async addUserAuth(payload: Partial<IUserAuth>): Promise<void> {
		await this._authRepository.addUserRefreshToken({
			id: payload.id || "",
			refreshToken: payload.refreshToken || "",
			accessToken: payload.accessToken || "",
			role: "user"
		});
	}

	async getUserToken(payload: Partial<IUserAuth>): Promise<void> {
		await this._authRepository.verifyUserRefreshToken({
			id: payload.id || "",
			refreshToken: payload.refreshToken || ""
		});
	}

	async editUser(payload: IUser): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyRole({ id: payload.id });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to edit this user");
		}

		if (payload.password) {
			payload.password = await bcrypt.hash(payload.password, 10);
		}

		await this._userRepository.editUserById(payload);
	}

	async editUserToken(payload: Partial<IUserAuth>): Promise<void> {
		await this._authRepository.updateUserAccessToken({
			id: payload.id,
			accessToken: payload.accessToken
		});
	}

	async logoutUser(payload: Partial<IUserAuth>): Promise<void> {
		await this._authRepository.verifyUserRefreshToken({
			id: payload.id,
			refreshToken: payload.refreshToken
		});
		await this._authRepository.deleteUserRefreshToken({
			id: payload.id,
			refreshToken: payload.refreshToken
		});
	}

	async deleteUser(payload: Partial<IUser>): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyRole({ id: payload.id });
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
