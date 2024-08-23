import Joi from "joi";

const AddCategoryPayloadSchema = Joi.object({
	name: Joi.string().min(3).max(100).required().error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).required().error(new Error("Method not allowed"))
});

const UpdateCategoryPayloadSchema = Joi.object({
	name: Joi.string().min(3).max(100).error(new Error("Method not allowed")),
	description: Joi.string().min(10).max(500).error(new Error("Method not allowed"))
});

export { AddCategoryPayloadSchema, UpdateCategoryPayloadSchema };
