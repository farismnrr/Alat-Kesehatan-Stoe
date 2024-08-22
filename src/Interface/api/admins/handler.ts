import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IAdmin, ILoginRequest, IRefreshToken } from "../../../Domain/models/interface";
import autoBind from "auto-bind";
import AdminValidator from "../../../App/validator/admins";
import AdminService from "../../../App/service/admin.service";

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
	private _validator: typeof AdminValidator;

	constructor(adminService: AdminService, validator: typeof AdminValidator) {
		autoBind(this);
		this._adminService = adminService;
		this._validator = validator;
	}

	// Start Admin Handler
	async postAdminHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IAdmin;
		this._validator.validateAdminPayload(payload);
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
		this._validator.validateAdminPayload(payload);
		const { id: credentialId } = request.auth.credentials as unknown as IAdmin;
		await this._adminService.editAdmin({ ...payload, id: credentialId });
		return h
			.response({
				status: "success",
				message: "Admin updated successfully"
			})
			.code(200);
	}

	async deleteAdminHandler(request: Request, h: ResponseToolkit) {
		const { id: credentialId } = request.auth.credentials as unknown as IAdmin;
		await this._adminService.deleteAdmin({ id: credentialId });
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
		const payload = request.payload as ILoginRequest;
		this._validator.validatePostAdminAuthPayload(payload);
		const {
			id: adminId,
			accessToken,
			refreshToken
		} = await this._adminService.loginAdmin(payload);
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
		const payload = request.payload as IRefreshToken;
		this._validator.validatePutAdminAuthPayload(payload);
		const accessToken = await this._adminService.updateToken(payload);
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
		const payload = request.payload as IRefreshToken;
		this._validator.validateDeleteAdminAuthPayload(payload);
		await this._adminService.logoutAdmin(payload);
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
