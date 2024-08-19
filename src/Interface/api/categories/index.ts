import type { Server } from "@hapi/hapi";
import routes from "./routes";
import CategoryHandler from "./handler";
import CategoryService from "../../../Infrastructure/repositories/database/category.service";
import CategoryValidator from "../../../App/validator/categories";

interface PluginOptions {
	categoryService: CategoryService;
	validator: typeof CategoryValidator;
}

export default {
	name: "categories",
	version: "1.0.0",
	register: async (server: Server, { categoryService, validator }: PluginOptions) => {
		const categoryHandler = new CategoryHandler(categoryService, validator);
		server.route(routes(categoryHandler));
	}
};
