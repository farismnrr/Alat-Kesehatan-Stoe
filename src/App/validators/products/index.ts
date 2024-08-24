import type { IProduct } from "../../../Common/models/types";
import { InvariantError } from "../../../Common/errors";
import { AddProductPayloadSchema, UpdateProductPayloadSchema } from "./schema";

const ProductValidator = {
	validateAddProductPayload: (payload: Partial<IProduct>) => {
		const validationResult = AddProductPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validateUpdateProductPayload: (payload: Partial<IProduct>) => {
		const validationResult = UpdateProductPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default ProductValidator;
