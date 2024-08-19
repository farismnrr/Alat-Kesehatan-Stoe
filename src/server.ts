import Jwt from "@hapi/jwt";
import Hapi from "@hapi/hapi";
import config from "./utils/config";

import users from "./api/users";
import UserService from "./service/database/UsersService";
import UserValidator from "./validator/users";

import admins from "./api/admins";
import AdminService from "./service/database/AdminsService";
import AdminValidator from "./validator/admins";

import products from "./api/products";
import ProductService from "./service/database/ProductsService";
import ProductValidator from "./validator/products";

import categories from "./api/categories";
import CategoryService from "./service/database/CategoriesService";
import CategoryValidator from "./validator/categories";

import CacheService from "./service/cache/CacheService";

import LogService from "./service/server/LogsService";
import AuthService from "./service/database/AuthService";
import MigrationsService from "./service/server/MigrationsService";

import ClientError from "./error/ClientError";
import TokenManager from "./token/TokenManager";

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

const externalPlugins = async (server: Hapi.Server) => {
	await server.register([
		{
			plugin: Jwt
		}
	]);

	const adminJwtOptions = {
		keys: config.jwt.accessTokenKey,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: config.jwt.accessTokenAge
		},
		validate: (payload: any) => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.adminId,
				role: "admin"
			}
		})
	};

	const userJwtOptions = {
		keys: config.jwt.accessTokenKey,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: config.jwt.accessTokenAge
		},
		validate: (payload: any) => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.userId,
				role: "user"
			}
		})
	};

	server.auth.strategy("admins", "jwt", adminJwtOptions);
	server.auth.strategy("users", "jwt", userJwtOptions);
};

const registerPlugins = async (server: Hapi.Server) => {
	const userService = new UserService();
	const authService = new AuthService();
	const adminService = new AdminService();
	const tokenManager = new TokenManager();
	const cacheService = new CacheService();
	const productService = new ProductService();
	const categoryService = new CategoryService();
	await server.register([
		{
			plugin: users,
			options: {
				authService,
				userService,
				tokenManager,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				authService,
				adminService,
				tokenManager,
				validator: AdminValidator
			}
		},
		{
			plugin: products,
			options: {
				productService,
				validator: ProductValidator
			}
		},
		{
			plugin: categories,
			options: {
				categoryService,
				validator: CategoryValidator
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
	await externalPlugins(server);
	await registerPlugins(server);
	handleClientError(server);
	handleServerLog(server);

	const migrationsService = new MigrationsService();
	await migrationsService.migrate();

	await server.start();
	console.log(`Server running at ${server.info.uri}`);
};

startServer();
