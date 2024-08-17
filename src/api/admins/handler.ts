import autoBind from "auto-bind";

class AdminHandler {
	private _service;
	private _validator;

	constructor(service: any, validator: any) {
		autoBind(this);
		this._service = service;
		this._validator = validator;
	}

	async postAdminHandler(request: any, h: any) {
		this._validator.validateAdminPayload(request.payload);
		const adminId = await this._service.addAdmin(request.payload);
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
		await this._service.editAdminById(id, request.payload);
		return h
			.response({
				status: "success",
				message: "Admin updated successfully"
			})
			.code(200);
	}

	async deleteAdminHandler(request: any, h: any) {
		const { id } = request.params;
		await this._service.deleteAdminById(id);
		return h
			.response({
				status: "success",
				message: "Admin deleted successfully"
			})
			.code(200);
	}
}

export default AdminHandler;
