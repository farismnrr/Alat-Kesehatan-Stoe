import type { Server } from "@hapi/hapi";
import routes from "./routes";
import ProductHandler from "./handler";
import ProductService from "../../../App/services/product.service";
import ProductValidator from "../../../App/validators/products";

interface PluginOptions {
	service: ProductService;
	validator: typeof ProductValidator;
}

export default {
	name: "products",
	version: "1.0.0",
	register: async (server: Server, { service, validator }: PluginOptions) => {
		const productHandler = new ProductHandler(service, validator);
		server.route(routes(productHandler));
	}
};
