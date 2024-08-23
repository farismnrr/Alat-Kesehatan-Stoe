import { Server } from "@hapi/hapi";
import routes from "./routes";
import UserHandler from "./handler";
import UserService from "../../../App/service/user.service";
import UserValidator from "../../../App/validator/users";
import TokenManager from "../../../Infrastructure/token/manager.token";

interface PluginOptions {
	token: TokenManager;
	service: UserService;
	validator: typeof UserValidator;
}

export default {
	name: "users",
	version: "1.0.0",
	register: async (server: Server, { token, service, validator }: PluginOptions) => {
		const userHandler = new UserHandler(token, service, validator);
		server.route(routes(userHandler));
	}
};
