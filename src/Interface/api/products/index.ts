import type { Server } from "@hapi/hapi";
import routes from "./routes";
import ProductHandler from "./handler";
import ProductService from "../../../Infrastructure/repositories/database/product.service";
import ProductValidator from "../../../App/validator/products";

interface PluginOptions {
	productService: ProductService;
	productValidator: typeof ProductValidator;
}

export default {
	name: "products",
	version: "1.0.0",
	register: async (server: Server, options: PluginOptions) => {
		const productHandler = new ProductHandler(options.productService, options.productValidator);
		server.route(routes(productHandler));
	}
};
