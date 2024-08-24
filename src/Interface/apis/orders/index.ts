import type { Server } from "@hapi/hapi";
import OrderHandler from "./handler";
// import OrderService from "../../../App/services/order.service";
import OrderRepository from "../../../Infrastructure/repositories/database/order.repository";
import OrderValidator from "../../../App/validators/orders";
import routes from "./routes";

interface PluginOptions {
	service: OrderRepository;
	validator: typeof OrderValidator;
}

export default {
	name: "orders",
	version: "1.0.0",
	register: async (server: Server, { service, validator }: PluginOptions) => {
		const orderHandler = new OrderHandler(service, validator);
		server.route(routes(orderHandler));
	}
};