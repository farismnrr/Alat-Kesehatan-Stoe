import { AddOrderItemPayloadSchema } from "./schema";   
import { InvariantError } from "../../../Common/errors";

const OrderValidator = {
	validateAddOrderItemPayload: (payload: any) => {
		const validationResult = AddOrderItemPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default OrderValidator;