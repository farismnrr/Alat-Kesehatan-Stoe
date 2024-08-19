import routes from "./routes";
import ProductHandler from "./handler";

export default {
	name: "products",
	version: "1.0.0",
	register: async (server: any, { productService, validator }: any) => {
		const productHandler = new ProductHandler(productService, validator);
		server.route(routes(productHandler));
	}
};
