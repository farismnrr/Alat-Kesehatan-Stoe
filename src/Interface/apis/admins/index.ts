import type { Server } from "@hapi/hapi";
import routes from "./routes";
import AdminHandler from "./handler";
import AdminService from "../../../App/services/admin.service";
import AdminValidator from "../../../App/validators/admins";
import TokenManager from "../../../Common/tokens/manager.token";

interface PluginOptions {
	service: AdminService;
	token: typeof TokenManager;
	validator: typeof AdminValidator;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (server: Server, { service, token, validator }: PluginOptions) => {
		const adminHandler = new AdminHandler(service, token, validator);
		server.route(routes(adminHandler));
	}
};
