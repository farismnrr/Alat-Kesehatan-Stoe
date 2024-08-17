import Hapi from "@hapi/hapi";
import config from "./utils/config";

import users from "./api/users";
import UserService from "./service/postgres/UsersService";
import UserValidator from "./validator/users";

import admins from "./api/admins";
import AdminService from "./service/postgres/AdminsService";
import AdminValidator from "./validator/admins";

import ClientError from "./error/ClientError";
import LogService from "./service/server/LogsService";
import MigrationsService from "./service/server/MigrationsService";

const createServer = () => {
	const server = new Hapi.Server({
		port: config.server.port,
		host: config.server.host,
		routes: {
			cors: {
				origin: ["*"],
				credentials: true
			}
		}
	});

	return server;
};

const registerPlugins = async (server: Hapi.Server) => {
	const userService = new UserService();
	const adminService = new AdminService();

	await server.register([
		{
			plugin: users,
			options: {
				service: userService,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				service: adminService,
				validator: AdminValidator
			}
		}
	]);
};

const handleClientError = (server: Hapi.Server) => {
	server.ext("onPreResponse", (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
		const { response } = request;
		if (response instanceof Error) {
			const newResponse = h.response({
				status: "fail",
				message: response.message
			});
			if (response instanceof ClientError) {
				newResponse.code(response.statusCode);
			} else {
				newResponse.code(500);
			}
			return newResponse;
		}
		return h.continue;
	});
};

const handleServerLog = (server: Hapi.Server) => {
	if (process.env.NODE_ENV !== "production") {
		server.ext("onRequest", (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			LogService.ServerRequestLog(request);
			return h.continue;
		});

		server.ext("onPreResponse", (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			LogService.ServerResponseLog(request, h);
			return h.continue;
		});
	}
};

const startServer = async () => {
	const server = createServer();
	await registerPlugins(server);
	handleClientError(server);
	handleServerLog(server);

	const migrationsService = new MigrationsService();
	await migrationsService.migrate();

	await server.start();
	console.log(`Server running at ${server.info.uri}`);
};

startServer();
