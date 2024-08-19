const routes = (handler: any) => [
	{
		method: "POST",
		path: "/products",
		handler: handler.postProductHandler
	}
];

export default routes;
