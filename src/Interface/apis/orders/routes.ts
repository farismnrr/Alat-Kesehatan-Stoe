import type { ServerRoute } from "@hapi/hapi";
import OrderHandler from "./handler";

const routes = (handler: OrderHandler): ServerRoute[] => [
	// Start Order Route
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
	},
	// End Order Route

	// Start Order Item Route
	{
		method: "POST",
		path: "/orders/{id}/items",
		handler: handler.postOrderItemHandler,
		options: {
			auth: "users"
		}
	},
	{
		method: "GET",
		path: "/orders/{id}/items",
		handler: handler.getOrderItemsHandler,
		options: {
			auth: "users"
		}
	},
	{
		method: "DELETE",
		path: "/orders/{id}/items/{itemId}",
		handler: handler.deleteOrderItemHandler,
		options: {
			auth: "users"
		}
	},
	// End Order Item Route
];

export default routes;
