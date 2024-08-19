import routes from "./routes";
import AdminHandler from "./handler";
import AdminService from "../../service/database/AdminsService";

interface PluginOptions {
	authService: any;
	adminService: AdminService;
	tokenManager: any;
	validator: any;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (
		server: any,
		{ authService, adminService, tokenManager, validator }: PluginOptions
	) => {
		const adminHandler = new AdminHandler({
			authService,
			adminService,
			tokenManager,
			validator
		});
		server.route(routes(adminHandler));
	}
};
