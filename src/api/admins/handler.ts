import autoBind from "auto-bind";

class AdminHandler {
	private _authService;
	private _adminService;
	private _tokenManager;
	private _validator;

	constructor(authService: any, adminService: any, tokenManager: any, validator: any) {
		autoBind(this);
		this._authService = authService;
		this._adminService = adminService;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start Admin Handler
	async postAdminHandler(request: any, h: any) {
		this._validator.validateAdminPayload(request.payload);
		const adminId = await this._adminService.addAdmin(request.payload);
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

	async updateAdminHandler(request: any, h: any) {
		this._validator.validateAdminPayload(request.payload);
		const { id } = request.params;
		await this._adminService.editAdminById(id, request.payload);
		return h
			.response({
				status: "success",
				message: "Admin updated successfully"
			})
			.code(200);
	}

	async deleteAdminHandler(request: any, h: any) {
		const { id } = request.params;
		await this._adminService.deleteAdminById(id);
		return h
			.response({
				status: "success",
				message: "Admin deleted successfully"
			})
			.code(200);
	}
	// End Admin Handler

	// Start Admin Auth Handler
	async postAdminAuthHandler(request: any, h: any) {
		this._validator.validatePostAdminAuthPayload(request.payload);

		const { username, password } = request.payload;
		const adminId = await this._adminService.verifyAdminCredential(username, password);
		const accessToken = this._tokenManager.generateAccessToken({ adminId });
		const refreshToken = this._tokenManager.generateRefreshToken({ adminId });
		await this._authService.addAdminRefreshToken(refreshToken, adminId);
		return h
			.response({
				status: "success",
				message: "Admin logged in successfully",
				data: {
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putAdminAuthHandler(request: any, h: any) {
		this._validator.validatePutAdminAuthPayload(request.payload);
		const { refreshToken } = request.payload;
		const { id } = request.params;
		await this._authService.verifyAdminRefreshToken(refreshToken, id);
		const { adminId } = this._tokenManager.verifyRefreshToken(refreshToken);
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

	async deleteAdminAuthHandler(request: any, h: any) {
		this._validator.validateDeleteAdminAuthPayload(request.payload);
		const { refreshToken } = request.payload;
		const { adminId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authService.verifyAdminRefreshToken(refreshToken, adminId);
		await this._authService.deleteAdminRefreshToken(refreshToken);
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
