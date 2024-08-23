import * as Hapi from "@hapi/hapi";
import Jwt from "@hapi/jwt";
import Config from "../../utils/config";

const ExternalPlugins = async (server: Hapi.Server) => {
	await server.register([
		{
			plugin: Jwt
		}
	]);

	const adminJwtOptions = {
		keys: Config.jwt.accessTokenKey,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: Config.jwt.accessTokenAge
		},
		validate: (payload: any) => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.id,
				role: "admin"
			}
		})
	};

	const userJwtOptions = {
		keys: Config.jwt.accessTokenKey,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: Config.jwt.accessTokenAge
		},
		validate: (payload: any) => ({
			isValid: true,
			credentials: {
				id: payload.decoded.payload.id,
				role: "user"
			}
		})
	};

	server.auth.strategy("admins", "jwt", adminJwtOptions);
	server.auth.strategy("users", "jwt", userJwtOptions);
};

export default ExternalPlugins;