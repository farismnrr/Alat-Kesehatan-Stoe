import Joi from "joi";

const UserSchema = Joi.object({
	username: Joi.string()
		.min(3)
		.max(30)
		.required()
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
	email: Joi.string().email().required().error(new Error("Invalid email format.")),
	birthdate: Joi.date().required().error(new Error("Birthdate is required.")),
	gender: Joi.string()
		.valid("male", "female")
		.required()
		.error(new Error("Gender must be either 'male' or 'female'.")),
	address: Joi.string()
		.min(10)
		.max(100)
		.required()
		.error(new Error("Address must be between 10 and 100 characters long.")),
	city: Joi.string()
		.min(3)
		.max(50)
		.required()
		.error(new Error("City must be between 3 and 50 characters long.")),
	contactNumber: Joi.string()
		.pattern(new RegExp("^[0-9]{10,15}$"))
		.required()
		.error(
			new Error(
				"Contact number must be between 10 and 15 digits long and can only contain numbers."
			)
		)
});

const PostUserAuthPayloadSchema = Joi.object({
	username: Joi.string().min(3).max(30).pattern(new RegExp("^[a-zA-Z0-9_]+$")),
	password: Joi.string()
		.min(8)
		.max(128)
		.required()
		.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$"))
		.error(new Error("Password is required.")),
	email: Joi.string().email().error(new Error("Invalid email format.")),
	birthdate: Joi.date().error(new Error("Invalid birthdate format.")),
	gender: Joi.string().valid("male", "female").error(new Error("Invalid gender format.")),
	address: Joi.string()
		.min(10)
		.max(100)
		.error(new Error("Address must be between 10 and 100 characters long.")),
	city: Joi.string()
		.min(3)
		.max(50)
		.error(new Error("City must be between 3 and 50 characters long.")),
	contactNumber: Joi.string()
		.pattern(new RegExp("^[0-9]{10,15}$"))
		.error(
			new Error(
				"Contact number must be between 10 and 15 digits long and can only contain numbers."
			)
		)
});

const PutUserAuthPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

const DeleteUserAuthPayloadSchema = Joi.object({
	refreshToken: Joi.string()
		.required()
		.trim()
		.regex(/^[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}\.[a-zA-Z0-9._\-\/+=]{1,}$/)
});

export {
	UserSchema,
	PostUserAuthPayloadSchema,
	PutUserAuthPayloadSchema,
	DeleteUserAuthPayloadSchema
};
