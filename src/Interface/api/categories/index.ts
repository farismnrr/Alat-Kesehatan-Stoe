import type { Server } from "@hapi/hapi";
import routes from "./routes";
import CategoryHandler from "./handler";
import CategoryRepository from "../../../Infrastructure/repositories/database/category.repository";
import CategoryValidator from "../../../App/validator/categories";

interface PluginOptions {
	categoryRepository: CategoryRepository;
	validator: typeof CategoryValidator;
}

export default {
	name: "categories",
	version: "1.0.0",
	register: async (server: Server, { categoryRepository, validator }: PluginOptions) => {
		const categoryHandler = new CategoryHandler(categoryRepository, validator);
		server.route(routes(categoryHandler));
	}
};
