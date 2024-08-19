import InvariantError from "../../../Common/errors";
import {
	AdminSchema,
	PostAdminAuthPayloadSchema,
	PutAdminAuthPayloadSchema,
	DeleteAdminAuthPayloadSchema
} from "./schema";

const AdminValidator = {
	validateAdminPayload: (payload: any) => {
		const validationResult = AdminSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePostAdminAuthPayload: (payload: any) => {
		const validationResult = PostAdminAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePutAdminAuthPayload: (payload: any) => {
		const validationResult = PutAdminAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateDeleteAdminAuthPayload: (payload: any) => {
		const validationResult = DeleteAdminAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default AdminValidator;
