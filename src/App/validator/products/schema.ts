import Joi from "joi";

const ProductPayloadSchema = Joi.object({
	productName: Joi.string().max(100).required(),
	description: Joi.string().min(10).max(500).required(),
	price: Joi.number().integer().positive().required(),
	stock: Joi.number().integer().min(0).required(),
	categoryId: Joi.string().guid({ version: "uuidv4" }).required()
});

export { ProductPayloadSchema };
