import routes from "./routes";
import AdminHandler from "./handler";

export default {
	name: "admins",
	version: "1.0.0",
	register: async (server: any, { authService, adminService, tokenManager, validator }: any) => {
		const adminHandler = new AdminHandler(authService, adminService, tokenManager, validator);
		server.route(routes(adminHandler));
	}
};
