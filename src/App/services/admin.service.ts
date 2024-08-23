import type { IAdmin, IAdminAuth } from "../../Common/models/interface";
import bcrypt from "bcrypt";
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
	loginAdmin(payload: Partial<IAdminAuth>): Promise<string>;
	addAdminAuth(payload: Partial<IAdminAuth>): Promise<void>;
	editAdmin(payload: IAdmin): Promise<void>;
	logoutAdmin(payload: Partial<IAdminAuth>): Promise<void>;
	deleteAdmin(payload: Partial<IAdmin>): Promise<void>;
}

class AdminService implements IAdminService {
	private _authRepository: AuthRepository;
	private _adminRepository: AdminRepository;
	constructor(authRepository: AuthRepository, adminRepository: AdminRepository) {
		this._authRepository = authRepository;
		this._adminRepository = adminRepository;
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
		if (!adminId) {
			throw new InvariantError("Failed to register admin");
		}
		return adminId;
	}

	async loginAdmin(payload: Partial<IAdminAuth>): Promise<string> {
		if (!payload.email && !payload.username) {
			throw new InvariantError("Email or username are required");
		}

		let adminData: IAdmin | null = null;
		if (payload.email) {
			adminData = await this._adminRepository.verifyEmail({ email: payload.email });
		}
		if (payload.username) {
			adminData = await this._adminRepository.verifyUsername({ username: payload.username });
		}
		if (!adminData) {
			throw new NotFoundError("Admin not found");
		}

		const isValidPassword = await bcrypt.compare(payload.password || "", adminData.password);
		if (!isValidPassword) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return adminData.id;
	}

	async addAdminAuth(payload: Partial<IAdminAuth>): Promise<void> {
		await this._authRepository.addAdminRefreshToken({
			id: payload.id || "",
			token: payload.refreshToken || "",
			role: "admin"
		});
	}

	async editAdmin(payload: IAdmin): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}
		
		const role = await this._authRepository.verifyRole({ id: payload.id });
		if (role !== "admin") {
			throw new AuthorizationError("You are not authorized to edit this admin");
		}

		if (payload.password) {
			payload.password = await bcrypt.hash(payload.password, 10);
		}

		await this._adminRepository.editAdminById(payload);
	}

	async editToken(payload: Partial<IAdminAuth>): Promise<void> {
		await this._authRepository.verifyAdminRefreshToken({
			id: payload.id || "",
			token: payload.refreshToken || ""
		});
	}

	async logoutAdmin(payload: Partial<IAdminAuth>): Promise<void> {
		await this._authRepository.verifyAdminRefreshToken({
			id: payload.id,
			token: payload.refreshToken
		});

		await this._authRepository.deleteAdminRefreshToken({
			id: payload.id,
			token: payload.refreshToken
		});
	}

	async deleteAdmin(payload: Partial<IAdmin>): Promise<void> {
		if (!payload.id) {
			throw new AuthenticationError("Access denied!");
		}

		const role = await this._authRepository.verifyRole({ id: payload.id });
		if (role !== "admin") {
			throw new AuthorizationError("You are not authorized to delete this admin");
		}

		await this._adminRepository.deleteAdminById(payload);
	}
}

export default AdminService;
