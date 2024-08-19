import type { Server } from "@hapi/hapi";
import routes from "./routes";
import AdminHandler from "./handler";
import AdminService from "../../../Infrastructure/repositories/database/admin.service";
import AuthService from "../../../Infrastructure/repositories/database/auth.service";
import TokenManager from "../../../Infrastructure/token/manager.token";
import AdminValidator from "../../../App/validator/admins";

interface PluginOptions {
	authService: AuthService;
	adminService: AdminService;
	tokenManager: TokenManager;
	validator: typeof AdminValidator;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (
		server: Server,
		{ authService, adminService, tokenManager, validator }: PluginOptions
	) => {
		const adminHandler = new AdminHandler(authService, adminService, tokenManager, validator);
		server.route(routes(adminHandler));
	}
};
