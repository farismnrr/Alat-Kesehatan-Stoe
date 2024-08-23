import type { ICategory } from "../../../Common/models/interface";
import { InvariantError } from "../../../Common/errors";
import { AddCategoryPayloadSchema, UpdateCategoryPayloadSchema } from "./schema";

const CategoryValidator = {
	validateAddCategoryPayload: (payload: Partial<ICategory>) => {
		const validationResult = AddCategoryPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateUpdateCategoryPayload: (payload: Partial<ICategory>) => {
		const validationResult = UpdateCategoryPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default CategoryValidator;
