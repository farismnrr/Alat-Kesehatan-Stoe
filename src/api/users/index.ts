import routes from "./routes";
import UserHandler from "./handler";

export default {
	name: "users",
	version: "1.0.0",
	register: async (server: any, { service, validator }: { service: any; validator: any }) => {
		const userHandler = new UserHandler(service, validator);
		server.route(routes(userHandler));
	}
};
