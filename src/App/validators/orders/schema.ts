import Joi from "joi";

const AddOrderItemPayloadSchema = Joi.object({
	productId: Joi.string().guid().required().error(new Error("Product ID is required")),
	quantity: Joi.number().integer().min(1).required().error(new Error("Quantity is required")),
});

export { AddOrderItemPayloadSchema };