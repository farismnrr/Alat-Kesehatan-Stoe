import Joi from "joi";

const AddOrderPayloadSchema = Joi.object({
	totalPrice: Joi.number()
		.min(0)
		.required()
		.error(new Error("Total price must be a non-negative number")),
});

export { AddOrderPayloadSchema };
