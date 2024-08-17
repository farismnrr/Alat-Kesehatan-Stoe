import { InvariantError } from "../../error/InvariantError";
import { AdminSchema } from "./schema";

const AdminValidator = {
	validateAdminPayload: (payload: any) => {
		const validationResult = AdminSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default AdminValidator;
