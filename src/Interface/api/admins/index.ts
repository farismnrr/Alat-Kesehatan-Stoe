import type { Server } from "@hapi/hapi";
import routes from "./routes";
import AdminHandler from "./handler";
import AdminService from "../../../App/service/admin.service";
import AdminValidator from "../../../App/validator/admins";
import TokenManager from "../../../Infrastructure/token/manager.token";

interface PluginOptions {
	token: TokenManager;
	service: AdminService;
	validator: typeof AdminValidator;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (server: Server, { token, service, validator }: PluginOptions) => {
		const adminHandler = new AdminHandler(token, service, validator);
		server.route(routes(adminHandler));
	}
};
