import { InvariantError } from "../../error/InvariantError";
import { CategoryPayloadSchema } from "./schema";

const CategoryValidator = {
	validateCategoryPayload: (payload: any) => {
		const validationResult = CategoryPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default CategoryValidator;
