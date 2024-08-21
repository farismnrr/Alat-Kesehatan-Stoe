import { Server } from "@hapi/hapi";
import routes from "./routes";
import UserHandler from "./handler";
import UserRepository from "../../../Infrastructure/repositories/database/user.repository";
import AuthRepository from "../../../Infrastructure/repositories/database/auth.repository";
import TokenManager from "../../../Infrastructure/token/manager.token";
import UserService from "../../../App/service/user.service";
import UserValidator from "../../../App/validator/users";

interface PluginOptions {
	authRepository: AuthRepository;
	userRepository: UserRepository;
	userService: UserService;
	tokenManager: TokenManager;
	validator: typeof UserValidator;
}

export default {
	name: "users",
	version: "1.0.0",
	register: async (
		server: Server,
		{ authRepository, userRepository, userService, tokenManager, validator }: PluginOptions
	) => {
		const userHandler = new UserHandler(
			authRepository,
			userRepository,
			userService,
			tokenManager,
			validator
		);
		server.route(routes(userHandler));
	}
};
