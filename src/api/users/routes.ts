const routes = (handler: any) => [
	{
		method: "POST",
		path: "/users",
		handler: handler.postUserHandler
	},
	{
		method: "PUT",
		path: "/users/{id}",
		handler: handler.updateUserHandler
	},
	{
		method: "DELETE",
		path: "/users/{id}",
		handler: handler.deleteUserHandler
	}
];

export default routes;
