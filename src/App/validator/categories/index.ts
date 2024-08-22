import { InvariantError } from "../../../Common/errors";
import { CategoryPayloadSchema, PostCategoryPayloadSchema } from "./schema";

const CategoryValidator = {
	validateCategoryPayload: (payload: any) => {
		const validationResult = CategoryPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePostCategoryPayload: (payload: any) => {
		const validationResult = PostCategoryPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default CategoryValidator;
