import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IAdmin, IRole, ILogin, IRefreshToken } from "../../../Domain/models/interface";
import autoBind from "auto-bind";
import AdminValidator from "../../../App/validator/admins";
import TokenManager from "../../../Infrastructure/token/manager.token";
import AdminRepository from "../../../Infrastructure/repositories/database/admin.repository";
import AuthRepository from "../../../Infrastructure/repositories/database/auth.repository";

interface IAdminHandler {
	// Start Admin Handler
	postAdminHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	updateAdminHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	deleteAdminHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	// End Admin Handler

	// Start Admin Auth Handler
	postAdminAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	putAdminAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	deleteAdminAuthHandler: (request: Request, h: ResponseToolkit) => Promise<any>;
	// End Admin Auth Handler
}

class AdminHandler implements IAdminHandler {
	private _authRepository: AuthRepository;
	private _adminRepository: AdminRepository;
	private _tokenManager: TokenManager;
	private _validator: typeof AdminValidator;

	constructor(
		authRepository: AuthRepository,
		adminRepository: AdminRepository,
		tokenManager: TokenManager,
		validator: typeof AdminValidator
	) {
		autoBind(this);
		this._authRepository = authRepository;
		this._adminRepository = adminRepository;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start Admin Handler
	async postAdminHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IAdmin;
		this._validator.validateAdminPayload(payload);
		const adminId = await this._adminRepository.addAdmin(payload);
		return h
			.response({
				status: "success",
				message: "Admin added successfully",
				data: {
					adminId
				}
			})
			.code(201);
	}

	async updateAdminHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IAdmin;
		this._validator.validateAdminPayload(payload);
		const { id: credentialId, role } = request.auth.credentials as unknown as IRole;
		await this._adminRepository.editAdminById({ id: credentialId, role }, payload);
		return h
			.response({
				status: "success",
				message: "Admin updated successfully"
			})
			.code(200);
	}

	async deleteAdminHandler(request: Request, h: ResponseToolkit) {
		const { id: credentialId, role } = request.auth.credentials as unknown as IRole;
		await this._adminRepository.deleteAdminById({ id: credentialId, role });
		return h
			.response({
				status: "success",
				message: "Admin deleted successfully"
			})
			.code(200);
	}
	// End Admin Handler

	// Start Admin Auth Handler
	async postAdminAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validatePostAdminAuthPayload(request.payload);
		const { username, password } = request.payload as ILogin;
		const adminId = await this._adminRepository.verifyAdminCredential({ username, password });
		const accessToken = this._tokenManager.generateAccessToken({ adminId });
		const refreshToken = this._tokenManager.generateRefreshToken({ adminId });
		await this._authRepository.addAdminRefreshToken({ id: adminId, token: refreshToken });
		return h
			.response({
				status: "success",
				message: "Admin logged in successfully",
				data: {
					adminId,
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putAdminAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validatePutAdminAuthPayload(request.payload);
		const { refreshToken } = request.payload as IRefreshToken;
		const { adminId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authRepository.verifyAdminRefreshToken({ id: adminId, token: refreshToken });
		const accessToken = this._tokenManager.generateAccessToken({ adminId });
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

	async deleteAdminAuthHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateDeleteAdminAuthPayload(request.payload);
		const { refreshToken } = request.payload as IRefreshToken;
		const { adminId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authRepository.verifyAdminRefreshToken({ id: adminId, token: refreshToken });
		await this._authRepository.deleteAdminRefreshToken({ id: adminId, token: refreshToken });
		return h
			.response({
				status: "success",
				message: "Refresh token deleted successfully"
			})
			.code(200);
	}
	// End Admin Auth Handler
}

export default AdminHandler;
