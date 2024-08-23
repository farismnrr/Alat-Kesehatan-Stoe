import type { IAdmin, IAdminAuth } from "../../../Common/models/interface/entities/admin.interface";
import { InvariantError } from "../../../Common/errors";
import { AddAdminPayloadSchema, UpdateAdminPayloadSchema, LoginAdminPayloadSchema, AuthPayloadSchema } from "./schema";

const AdminValidator = {
	validateAddAdminPayload: (payload: Partial<IAdmin>) => {
		const validationResult = AddAdminPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateUpdateAdminPayload: (payload: Partial<IAdmin>) => {
		const validationResult = UpdateAdminPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateLoginAdminPayload: (payload: Partial<IAdmin>) => {
		const validationResult = LoginAdminPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateAuthPayload: (payload: Partial<IAdminAuth>) => {
		const validationResult = AuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default AdminValidator;
