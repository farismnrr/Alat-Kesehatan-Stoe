const routes = (handler: any) => [
	// Start User Routes
	{
		method: "POST",
		path: "/users",
		handler: handler.postUserHandler
	},
	{
		method: "PUT",
		path: "/users",
		handler: handler.updateUserHandler,
		options: {
			auth: "users"
		}
	},
	{
		method: "DELETE",
		path: "/users",
		handler: handler.deleteUserHandler,
		options: {
			auth: "users"
		}
	},
	// End User Routes

	// Start User Auth Routes
	{
		method: "POST",
		path: "/users/auth",
		handler: handler.postUserAuthHandler
	},
	{
		method: "PUT",
		path: "/users/auth",
		handler: handler.putUserAuthHandler
	},
	{
		method: "DELETE",
		path: "/users/auth",
		handler: handler.deleteUserAuthHandler
	}
	// End User Auth Routes
];

export default routes;
