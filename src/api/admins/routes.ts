const routes = (handler: any) => [ 
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
	}
]

export default routes;
