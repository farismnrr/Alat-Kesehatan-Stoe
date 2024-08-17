import { InvariantError } from "../../error/InvariantError";
import { UserSchema } from "./schema";

const UserValidator = {
	validateUserPayload: (payload: any) => {
		const validationResult = UserSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default UserValidator;
