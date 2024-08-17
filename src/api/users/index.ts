import routes from "./routes";
import UserHandler from "./handler";

export default {
	name: "users",
	version: "1.0.0",
	register: async (server: any, { authService, userService, tokenManager, validator }: any) => {
		const userHandler = new UserHandler(authService, userService, tokenManager, validator);
		server.route(routes(userHandler));
	}
};
