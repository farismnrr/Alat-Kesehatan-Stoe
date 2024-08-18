import autoBind from "auto-bind";

class UserHandler {
	private _authService;
	private _userService;
	private _tokenManager;
	private _validator;

	constructor(authService: any, userService: any, tokenManager: any, validator: any) {
		autoBind(this);
		this._authService = authService;
		this._userService = userService;
		this._tokenManager = tokenManager;
		this._validator = validator;
	}

	// Start User Handler
	async postUserHandler(request: any, h: any) {
		this._validator.validateUserPayload(request.payload);
		const userId = await this._userService.addUser(request.payload);
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

	async updateUserHandler(request: any, h: any) {
		this._validator.validateUserPayload(request.payload);
		const { id: credentialId, role } = request.auth.credentials;
		await this._userService.editUserById(credentialId, role, request.payload);
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: any, h: any) {
		const { id: credentialId, role } = request.auth.credentials;
		await this._userService.deleteUserById(credentialId, role);
		return h
			.response({
				status: "success",
				message: "User deleted successfully"
			})
			.code(200);
	}
	// End User Handler

	// Start User Auth Handler
	async postUserAuthHandler(request: any, h: any) {
		this._validator.validatePostUserAuthPayload(request.payload);

		const { username, password } = request.payload;
		const userId = await this._userService.verifyUserCredential(username, password);
		const accessToken = this._tokenManager.generateAccessToken({ userId });
		const refreshToken = this._tokenManager.generateRefreshToken({ userId });
		await this._authService.addUserRefreshToken(refreshToken, userId);
		return h
			.response({
				status: "success",
				message: "User logged in successfully",
				data: {
					accessToken,
					refreshToken
				}
			})
			.code(201);
	}

	async putUserAuthHandler(request: any, h: any) {
		this._validator.validatePutUserAuthPayload(request.payload);
		const { refreshToken } = request.payload;
		const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authService.verifyUserRefreshToken(refreshToken, userId);
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

	async deleteUserAuthHandler(request: any, h: any) {
		this._validator.validateDeleteUserAuthPayload(request.payload);
		const { refreshToken } = request.payload;
		const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
		await this._authService.verifyUserRefreshToken(refreshToken, userId);
		await this._authService.deleteUserRefreshToken(refreshToken, userId);
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
