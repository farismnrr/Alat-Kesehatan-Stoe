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
		const { id } = request.params;
		await this._userService.editUserById(id, request.payload);
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: any, h: any) {
		const { id } = request.params;
		await this._userService.deleteUserById(id);
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
		const id = await this._userService.verifyUserCredential(username, password);
		const accessToken = this._tokenManager.generateAccessToken({ id });
		const refreshToken = this._tokenManager.generateRefreshToken({ id });
		await this._authService.addRefreshToken(refreshToken);
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
		await this._authService.verifyRefreshToken(refreshToken);
		const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
		const accessToken = this._tokenManager.generateAccessToken({ id });
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
		await this._authService.verifyRefreshToken(refreshToken);
		await this._authService.deleteRefreshToken(refreshToken);
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
