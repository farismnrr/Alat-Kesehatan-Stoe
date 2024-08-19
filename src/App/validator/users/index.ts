import { InvariantError } from "../../../Common/errors";
import {
	UserSchema,
	PostUserAuthPayloadSchema,
	PutUserAuthPayloadSchema,
	DeleteUserAuthPayloadSchema
} from "./schema";

const UserValidator = {
	validateUserPayload: (payload: any) => {
		const validationResult = UserSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePostUserAuthPayload: (payload: any) => {
		const validationResult = PostUserAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePutUserAuthPayload: (payload: any) => {
		const validationResult = PutUserAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateDeleteUserAuthPayload: (payload: any) => {
		const validationResult = DeleteUserAuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default UserValidator;
