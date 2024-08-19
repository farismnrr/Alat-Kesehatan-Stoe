import Joi from "joi";

const CategoryPayloadSchema = Joi.object({
	name: Joi.string().min(3).max(100).required(),
	description: Joi.string().min(10).max(500).required()
});

export { CategoryPayloadSchema };
