import Joi from "joi";

const AdminSchema = Joi.object({
	username: Joi.string()
		.min(3)
		.max(30)
		.pattern(new RegExp("^[a-zA-Z0-9_]+$"))
		.error(
			new Error(
				"Username must be between 3 and 20 characters long and can only contain letters, numbers, and underscores."
			)
		),
	password: Joi.string()
		.min(8)
		.max(128)
		.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$"))
		.error(
			new Error(
				"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
			)
		),
	email: Joi.string().email().error(new Error("Invalid email format."))
});

const PostAdminAuthPayloadSchema = Joi.object({
	username: Joi.string()
		.min(3)
		.max(30)
		.pattern(new RegExp("^[a-zA-Z0-9_]+$"))
		.error(
			new Error(
				"Username must be between 3 and 20 characters long and can only contain letters, numbers, and underscores."
			)
		),
	password: Joi.string()
		.min(8)
		.max(128)
		.required()
		.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$"))
		.error(
			new Error(
				"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
			)
		),
	email: Joi.string().email().error(new Error("Invalid email format."))
});

const PutAdminAuthPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

const DeleteAdminAuthPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

export {
	AdminSchema,
	PostAdminAuthPayloadSchema,
	PutAdminAuthPayloadSchema,
	DeleteAdminAuthPayloadSchema
};
