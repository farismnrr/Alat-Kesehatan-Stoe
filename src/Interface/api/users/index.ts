import { Server } from "@hapi/hapi";
import routes from "./routes";
import UserHandler from "./handler";
import UserService from "../../../Infrastructure/repositories/database/user.service";
import AuthService from "../../../Infrastructure/repositories/database/auth.service";
import TokenManager from "../../../Infrastructure/token/manager.token";
import UserValidator from "../../../App/validator/users";

interface PluginOptions {
	authService: AuthService;
	userService: UserService;
	tokenManager: TokenManager;
	validator: typeof UserValidator;
}

export default {
	name: "users",
	version: "1.0.0",
	register: async (
		server: Server,
		{ authService, userService, tokenManager, validator }: PluginOptions
	) => {
		const userHandler = new UserHandler(authService, userService, tokenManager, validator);
		server.route(routes(userHandler));
	}
};
