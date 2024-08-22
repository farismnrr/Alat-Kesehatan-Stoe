import { InvariantError } from "../../../Common/errors";
import { ProductPayloadSchema, PostProductPayloadSchema } from "./schema";

const ProductValidator = {
	validateProductPayload: (payload: any) => {
		const validationResult = ProductPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	},
	validatePostProductPayload: (payload: any) => {
		const validationResult = PostProductPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default ProductValidator;
