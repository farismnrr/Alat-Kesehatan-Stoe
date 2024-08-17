import { InvariantError } from "../../error/InvariantError";
import {
	PostAuthenticationPayloadSchema,
	PutAuthenticationPayloadSchema,
	DeleteAuthenticationPayloadSchema
} from "./schema";

class AuthenticationsValidator {
	validatePostAuthenticationPayload(payload: any) {
		const validationResult = PostAuthenticationPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}

	validatePutAuthenticationPayload(payload: any) {
		const validationResult = PutAuthenticationPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}

	validateDeleteAuthenticationPayload(payload: any) {
		const validationResult = DeleteAuthenticationPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
}

export default AuthenticationsValidator;
