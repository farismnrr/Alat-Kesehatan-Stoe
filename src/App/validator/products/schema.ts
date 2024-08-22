import Joi from "joi";

const ProductPayloadSchema = Joi.object({
	productName: Joi.string().max(100).error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).error(new Error("Method not allowed")),
	price: Joi.number().integer().positive().error(new Error("Method not allowed")),
	stock: Joi.number().integer().min(0).error(new Error("Method not allowed")),
	categoryId: Joi.string().guid({ version: "uuidv4" }).error(new Error("Method not allowed"))
});

const PostProductPayloadSchema = Joi.object({
	productName: Joi.string().max(100).error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).error(new Error("Method not allowed")),
	price: Joi.number().integer().positive().error(new Error("Method not allowed")),
	stock: Joi.number().integer().min(0).error(new Error("Method not allowed")),
	categoryId: Joi.string().guid({ version: "uuidv4" }).required().error(new Error("Method not allowed"))
});

export { ProductPayloadSchema, PostProductPayloadSchema };
