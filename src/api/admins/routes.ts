const routes = (handler: any) => [
	// Start Admin Routes
	{
		method: "POST",
		path: "/admins",
		handler: handler.postAdminHandler
	},
	{
		method: "PUT",
		path: "/admins",
		handler: handler.updateAdminHandler,
		options: {
			auth: "admins"
		}
	},
	{
		method: "DELETE",
		path: "/admins",
		handler: handler.deleteAdminHandler,
		options: {
			auth: "admins"
		}
	},
	// End Admin Routes

	// Start Admin Auth Routes
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
	// End Admin Auth Routes
];

export default routes;
