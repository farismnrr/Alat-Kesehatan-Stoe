import { Server } from "@hapi/hapi";
import routes from "./routes";
import UserHandler from "./handler";
import UserService from "../../../App/services/user.service";
import UserValidator from "../../../App/validators/users";
import TokenManager from "../../../Common/tokens/manager.token";

interface PluginOptions {
	service: UserService;
	token: typeof TokenManager;
	validator: typeof UserValidator;
}

export default {
	name: "users",
	version: "1.0.0",
	register: async (server: Server, { service, token, validator }: PluginOptions) => {
		const userHandler = new UserHandler(service, token, validator);
		server.route(routes(userHandler));
	}
};
