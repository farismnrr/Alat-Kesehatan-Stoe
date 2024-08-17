import routes from "./routes";
import AdminHandler from "./handler";

export default {
	name: "admins",
	version: "1.0.0",
	register: async (server: any, { service, validator }: { service: any; validator: any }) => {
		const adminHandler = new AdminHandler(service, validator);
		server.route(routes(adminHandler));
	}
};
