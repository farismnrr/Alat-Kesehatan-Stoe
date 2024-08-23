import type { ServerRoute } from "@hapi/hapi";
import ProductHandler from "./handler";

const routes = (handler: ProductHandler): ServerRoute[] => [
	{
		method: "POST",
		path: "/products",
		handler: handler.postProductHandler
	},
	{
		method: "GET",
		path: "/products",
		handler: handler.getProductsHandler
	},
	{
		method: "GET",
		path: "/products/{id}",
		handler: handler.getProductByIdHandler
	},
	{
		method: "PUT",
		path: "/products/{id}",
		handler: handler.updateProductByIdHandler
	},
	{
		method: "DELETE",
		path: "/products/{id}",
		handler: handler.deleteProductByIdHandler
	}
];

export default routes;
