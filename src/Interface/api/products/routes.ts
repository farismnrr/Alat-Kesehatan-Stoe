import type { ServerRoute } from "@hapi/hapi";
import ProductHandler from "./handler";

const routes = (handler: ProductHandler): ServerRoute[] => [
	{
		method: "POST",
		path: "/products",
		handler: handler.postProductHandler
	}
];

export default routes;
