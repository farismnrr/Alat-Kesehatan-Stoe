import Joi from "joi";

const AddProductPayloadSchema = Joi.object({
	productName: Joi.string().max(100).required().error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).required().error(new Error("Method not allowed")),
	price: Joi.number().integer().positive().required().error(new Error("Method not allowed")),
	stock: Joi.number().integer().min(0).required().error(new Error("Method not allowed")),
	categoryId: Joi.string()
		.guid({ version: "uuidv4" })
		.required()
		.error(new Error("Category ID is required"))
});

const UpdateProductPayloadSchema = Joi.object({
	productName: Joi.string().max(100).error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).error(new Error("Method not allowed")),
	price: Joi.number().integer().positive().error(new Error("Method not allowed")),
	stock: Joi.number().integer().min(0).error(new Error("Method not allowed")),
	categoryId: Joi.string()
		.guid({ version: "uuidv4" })
		.required()
		.error(new Error("Category ID is required"))
});

export { AddProductPayloadSchema, UpdateProductPayloadSchema };
