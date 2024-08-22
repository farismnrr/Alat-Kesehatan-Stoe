import { Server } from "@hapi/hapi";
import routes from "./routes";
import UserHandler from "./handler";
import UserService from "../../../App/service/user.service";
import UserValidator from "../../../App/validator/users";

interface PluginOptions {
	userService: UserService;
	validator: typeof UserValidator;
}

export default {
	name: "users",
	version: "1.0.0",
	register: async (server: Server, { userService, validator }: PluginOptions) => {
		const userHandler = new UserHandler(userService, validator);
		server.route(routes(userHandler));
	}
};
