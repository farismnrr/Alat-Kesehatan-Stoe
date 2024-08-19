import routes from "./routes";
import CategoryHandler from "./handler";

export default {
	name: "categories",
	version: "1.0.0",
	register: async (server: any, { categoryService, validator }: any) => {
		const categoryHandler = new CategoryHandler(categoryService, validator);
		server.route(routes(categoryHandler));
	}
};
