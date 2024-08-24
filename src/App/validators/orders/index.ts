import type { IOrder } from "../../../Common/models/types";
import { InvariantError } from "../../../Common/errors";
import { AddOrderPayloadSchema } from "./schema";

const OrderValidator = {
	validateAddOrderPayload: (payload: Partial<IOrder>) => {
		const validationResult = AddOrderPayloadSchema.validate(payload);
		if (validationResult.error) {
			throw new InvariantError(validationResult.error.message);
		}
	}
};

export default OrderValidator;
