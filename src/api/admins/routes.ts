const routes = (handler: any) => [
	// Start Admin Routes
	{
		method: "POST",
		path: "/admins",
		handler: handler.postAdminHandler
	},
	{
		method: "PUT",
		path: "/admins/{id}",
		handler: handler.updateAdminHandler
	},
	{
		method: "DELETE",
		path: "/admins/{id}",
		handler: handler.deleteAdminHandler
	},
	// End Admin Routes

	// Start Auth Routes
	{
		method: "POST",
		path: "/admins/auth",
		handler: handler.postAdminAuthHandler
	},
	{
		method: "PUT",
		path: "/admins/auth",
		handler: handler.putAdminAuthHandler
	},
	{
		method: "DELETE",
		path: "/admins/auth",
		handler: handler.deleteAdminAuthHandler
	}
	// End Auth Routes
];

export default routes;
