import type { ServerRoute } from "@hapi/hapi";
import OrderHandler from "./handler";

const routes = (handler: OrderHandler): ServerRoute[] => [
	{
		method: "POST",
		path: "/orders",
		handler: handler.postOrderHandler,
		options: {
			auth: "users"
		}
	},
	{
		method: "GET",
		path: "/orders",
		handler: handler.getOrderByIdHandler,
		options: {
			auth: "users"
		}
	},
	{
		method: "DELETE",
		path: "/orders/{id}",
		handler: handler.deleteOrderByIdHandler,
		options: {
			auth: "users"
		}
	}
];

export default routes;
