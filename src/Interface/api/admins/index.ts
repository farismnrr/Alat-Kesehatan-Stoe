import type { Server } from "@hapi/hapi";
import routes from "./routes";
import AdminHandler from "./handler";
import AdminRepository from "../../../Infrastructure/repositories/database/admin.repository";
import AuthRepository from "../../../Infrastructure/repositories/database/auth.repository";
import TokenManager from "../../../Infrastructure/token/manager.token";
import AdminService from "../../../App/service/admin.service";
import AdminValidator from "../../../App/validator/admins";

interface PluginOptions {
	authRepository: AuthRepository;
	adminRepository: AdminRepository;
	adminService: AdminService;
	tokenManager: TokenManager;
	validator: typeof AdminValidator;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (
		server: Server,
		{ authRepository, adminRepository, adminService, tokenManager, validator }: PluginOptions
	) => {
		const adminHandler = new AdminHandler(authRepository, adminRepository, adminService, tokenManager, validator);
		server.route(routes(adminHandler));
	}
};
