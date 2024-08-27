import Hapi from "@hapi/hapi";
import Config from "./Infrastructure/settings/config";
import ClientError from "./Common/errors";
import CustomPlugins from "./Infrastructure/plugins/custom.plugin";
import ExternalPlugins from "./Infrastructure/plugins/external.plugin";
import LogService from "./App/services/log.service";
import MigrationsService from "./App/services/migration.service";

const createServer = () => {
	const server = new Hapi.Server({
		port: Config.server.port,
		host: Config.server.host,
		routes: {
			cors: {
				origin: ["*"],
				credentials: true
			}
		}
	});

	return server;
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
			} else if (response instanceof Error) {
				if (response.message === "invalid input syntax for type uuid: \"xxx\"") {
					newResponse.code(400);
				} else {
					newResponse.code(401);
				}
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
	await ExternalPlugins(server);
	await CustomPlugins(server);
	handleClientError(server);
	handleServerLog(server);

	const migrationsService = new MigrationsService();
	await migrationsService.migrate();

	await server.start();
	console.log(`Server running at ${server.info.uri}`);
};

startServer();
