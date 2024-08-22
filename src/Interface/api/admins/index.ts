import type { Server } from "@hapi/hapi";
import routes from "./routes";
import AdminHandler from "./handler";
import AdminService from "../../../App/service/admin.service";
import AdminValidator from "../../../App/validator/admins";

interface PluginOptions {
	adminService: AdminService;
	validator: typeof AdminValidator;
}

export default {
	name: "admins",
	version: "1.0.0",
	register: async (server: Server, { adminService, validator }: PluginOptions) => {
		const adminHandler = new AdminHandler(adminService, validator);
		server.route(routes(adminHandler));
	}
};
