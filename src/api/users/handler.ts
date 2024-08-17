import autoBind from "auto-bind";

class UserHandler {
	private _service;
	private _validator;

	constructor(service: any, validator: any) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

	async postUserHandler(request: any, h: any) {
		this._validator.validateUserPayload(request.payload);
		const userId = await this._service.addUser(request.payload);
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
		await this._service.editUserById(id, request.payload);
		return h
			.response({
				status: "success",
				message: "User updated successfully"
			})
			.code(200);
	}

	async deleteUserHandler(request: any, h: any) {
		const { id } = request.params;
		await this._service.deleteUserById(id);
		return h
			.response({
				status: "success",
				message: "User deleted successfully"
			})
			.code(200);
	}
}

export default UserHandler;
