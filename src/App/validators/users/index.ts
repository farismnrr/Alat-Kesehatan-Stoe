import type { IUser, IUserAuth } from "../../../Common/models/types/entities/user.types";
import { InvariantError } from "../../../Common/errors";
import {
	AddUserPayloadSchema,
	UpdateUserPayloadSchema,
	LoginUserPayloadSchema,
	AuthPayloadSchema
} from "./schema";

const UserValidator = {
	validateAddUserPayload: (payload: Partial<IUser>) => {
		const validationResult = AddUserPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateUpdateUserPayload: (payload: Partial<IUser>) => {
		const validationResult = UpdateUserPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateLoginUserPayload: (payload: Partial<IUser>) => {
		const validationResult = LoginUserPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateAuthPayload: (payload: IUserAuth) => {
		const validationResult = AuthPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default UserValidator;
