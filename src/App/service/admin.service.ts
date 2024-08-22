import type {
	IAdmin,
	ILoginRequest,
	ILoginResponse,
	IRefreshToken
} from "../../Domain/models/interface";
import bcrypt from "bcrypt";
import TokenManager from "../../Infrastructure/token/manager.token";
import AdminRepository from "../../Infrastructure/repositories/database/admin.repository";
import AuthRepository from "../../Infrastructure/repositories/database/auth.repository";
import { v4 as uuidv4 } from "uuid";
import {
	InvariantError,
	NotFoundError,
	AuthenticationError,
	AuthorizationError
} from "../../Common/errors";

interface IAdminService {
	registerAdmin(payload: IAdmin): Promise<string>;
	loginAdmin(payload: ILoginRequest): Promise<ILoginResponse>;
	editAdmin(payload: IAdmin): Promise<void>;
	updateToken(payload: ILoginResponse): Promise<string>;
	logoutAdmin(payload: ILoginResponse): Promise<void>;
	deleteAdmin(payload: Partial<IAdmin>): Promise<void>;
}

class AdminService implements IAdminService {
	private _authRepository: AuthRepository;
	private _adminRepository: AdminRepository;
	private _tokenManager: TokenManager;

	constructor(
		authRepository: AuthRepository,
		adminRepository: AdminRepository,
		tokenManager: TokenManager
	) {
		this._authRepository = authRepository;
		this._adminRepository = adminRepository;
		this._tokenManager = tokenManager;
	}

	async registerAdmin(payload: IAdmin): Promise<string> {
		if (payload.email === "" || payload.password === "" || payload.username === "") {
			throw new InvariantError("Email, password, and username are required");
		}

		const username = await this._adminRepository.verifyUsername({ username: payload.username });
		if (username) {
			throw new InvariantError("Username already exists");
		}

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(payload.password, 10);
		const adminId = await this._adminRepository.addAdmin({
			...payload,
			id,
			password: hashedPassword
		});
		return adminId;
	}

	async loginAdmin(payload: ILoginRequest): Promise<ILoginResponse> {
		if (!payload.email && !payload.username) {
			throw new InvariantError("Email or username are required");
		}

		const adminEmail = (await this._adminRepository.verifyEmail(payload)) as unknown as IAdmin;
		const adminUsername = (await this._adminRepository.verifyUsername(
			payload
		)) as unknown as IAdmin;
		if (!adminUsername && !adminEmail) {
			throw new NotFoundError("Admin not found");
		}

		const adminData = adminUsername || adminEmail;
		const match = await bcrypt.compare(payload.password || "", adminData.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		const accessToken = this._tokenManager.generateAccessToken({ adminId: adminData.id });
		const refreshToken = this._tokenManager.generateRefreshToken({ adminId: adminData.id });
		await this._authRepository.addAdminRefreshToken({
			id: adminData.id,
			token: refreshToken,
			role: "admin"
		});

		return { id: adminData.id, accessToken, refreshToken };
	}

	async editAdmin(payload: IAdmin): Promise<void> {
		if (!payload.email && !payload.password && !payload.username) {
			throw new InvariantError("Email, password, and username are required");
		}
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyAdminRole({ id: payload.id });
		if (role !== "admin") {
			throw new AuthorizationError("You are not authorized to edit this admin");
		}

		await this._adminRepository.verifyEmail(payload);
		const hashedPassword = await bcrypt.hash(payload.password, 10);
		await this._adminRepository.editAdminById({
			...payload,
			password: hashedPassword
		});
	}

	async updateToken(payload: IRefreshToken): Promise<string> {
		const { adminId, expiresAt } = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		if (expiresAt < Date.now() / 1000) {
			throw new AuthenticationError("Refresh token has expired!");
		}
		if (!adminId) {
			throw new AuthenticationError("Invalid admin ID!");
		}

		const accessToken = this._tokenManager.generateAccessToken({ adminId });
		if (!accessToken) {
			throw new AuthenticationError("Access denied!");
		}

		return accessToken;
	}

	async logoutAdmin(payload: IRefreshToken): Promise<void> {
		const { adminId, expiresAt } = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		if (expiresAt < Date.now() / 1000) {
			throw new AuthenticationError("Refresh token has expired!");
		}
		if (!adminId) {
			throw new AuthenticationError("Invalid admin ID!");
		}

		await this._authRepository.verifyAdminRefreshToken({
			id: adminId,
			token: payload.refreshToken
		});
		await this._authRepository.deleteAdminRefreshToken({
			id: adminId,
			token: payload.refreshToken
		});
	}

	async deleteAdmin(payload: Partial<IAdmin>): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyAdminRole({ id: payload.id });
		if (role !== "admin") {
			throw new AuthorizationError("You are not authorized to delete this admin");
		}

		const adminId = await this._adminRepository.deleteAdminById(payload);
		if (!adminId) {
			throw new NotFoundError("Admin not found");
		}
	}
}

export default AdminService;
