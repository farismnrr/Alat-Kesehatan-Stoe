import type { Server } from "@hapi/hapi";
import routes from "./routes";
import CategoryHandler from "./handler";
import CategoryService from "../../../App/services/category.service";
import CategoryValidator from "../../../App/validators/categories";

interface PluginOptions {
	service: CategoryService;
	validator: typeof CategoryValidator;
}

export default {
	name: "categories",
	version: "1.0.0",
	register: async (server: Server, { service, validator }: PluginOptions) => {
		const categoryHandler = new CategoryHandler(service, validator);
		server.route(routes(categoryHandler));
	}
};
