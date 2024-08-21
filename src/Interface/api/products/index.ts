import type { Server } from "@hapi/hapi";
import routes from "./routes";
import ProductHandler from "./handler";
import ProductRepository from "../../../Infrastructure/repositories/database/product.repository";
import ProductValidator from "../../../App/validator/products";

interface PluginOptions {
	productRepository: ProductRepository;
	validator: typeof ProductValidator;
}

export default {
	name: "products",
	version: "1.0.0",
	register: async (server: Server, { productRepository, validator }: PluginOptions) => {
		const productHandler = new ProductHandler(productRepository, validator);
		server.route(routes(productHandler));
	}
};
