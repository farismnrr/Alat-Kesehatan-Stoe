import Joi from "joi";

const PostAuthenticationPayloadSchema = Joi.object({
	username: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_]+$/),

	password: Joi.string()
		.required()
		.trim()
		.min(3)
		.max(128)
		.regex(/^[a-zA-Z0-9_!@#$%^&*()]+$/)
});

const PutAuthenticationPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

const DeleteAuthenticationPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

export {
	PostAuthenticationPayloadSchema,
	PutAuthenticationPayloadSchema,
	DeleteAuthenticationPayloadSchema
};
