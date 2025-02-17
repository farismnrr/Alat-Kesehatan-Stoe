import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IAdmin, IAdminAuth } from "../../../Common/models/types";
import autoBind from "auto-bind";
import AdminValidator from "../../../App/validators/admins";
import AdminService from "../../../App/services/admin.service";
import TokenManager from "../../../Common/tokens/manager.token";

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
	private _adminService: AdminService;
	private _tokenManager: typeof TokenManager;
	private _validator: typeof AdminValidator;

	constructor(
		adminService: AdminService,
		tokenManager: typeof TokenManager,
		validator: typeof AdminValidator
	) {
		autoBind(this);
		this._adminService = adminService;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start Admin Handler
	async postAdminHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IAdmin;
		this._validator.validateAddAdminPayload(payload);
		const adminId = await this._adminService.registerAdmin(payload);
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
		this._validator.validateUpdateAdminPayload(payload);
		const admin = request.auth.credentials as unknown as IAdmin;
		await this._adminService.editAdmin({ ...payload, id: admin.id });
		return h
			.response({
				status: "success",
				message: "Admin updated successfully"
			})
			.code(200);
	}

	async deleteAdminHandler(request: Request, h: ResponseToolkit) {
		const admin = request.auth.credentials as unknown as IAdmin;
		await this._adminService.deleteAdmin({ id: admin.id });
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
		const payload = request.payload as IAdminAuth;
		this._validator.validateLoginAdminPayload(payload);
		const adminId = await this._adminService.loginAdmin(payload);
		const accessToken = this._tokenManager.generateAccessToken({ id: adminId });
		const refreshToken = this._tokenManager.generateRefreshToken({ id: adminId });
		await this._adminService.addAdminAuth({ id: adminId, refreshToken, accessToken });
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
		const payload = request.payload as IAdminAuth;
		this._validator.validateAuthPayload(payload);
		const adminId = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		await this._adminService.getAdminToken({
			id: adminId,
			refreshToken: payload.refreshToken
		});
		const accessToken = this._tokenManager.generateAccessToken({ id: adminId });
		await this._adminService.editAdminToken({
			id: adminId,
			accessToken
		});
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
		const payload = request.payload as IAdminAuth;
		this._validator.validateAuthPayload(payload);
		const adminId = this._tokenManager.verifyRefreshToken(payload.refreshToken);
		await this._adminService.logoutAdmin({
			id: adminId,
			refreshToken: payload.refreshToken
		});
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
