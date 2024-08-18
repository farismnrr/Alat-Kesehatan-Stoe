import Jwt from "@hapi/jwt";
import config from "../utils/config";
import { InvariantError } from "../error/InvariantError";
import { AuthenticationError } from "../error/AuthError";

class TokenManager {
	generateAccessToken(payload: any): string {
		if (!config.jwt.accessTokenKey) {
			throw new InvariantError("Access token key is invalid.");
		}
		return Jwt.token.generate(payload, config.jwt.accessTokenKey);
	}

	generateRefreshToken(payload: any): string {
		if (!config.jwt.refreshTokenKey) {
			throw new InvariantError("Refresh token key is invalid.");
		}
		return Jwt.token.generate(payload, config.jwt.refreshTokenKey);
	}

	verifyRefreshToken(refreshToken: string): any {
		try {
			const artifacts = Jwt.token.decode(refreshToken);
			Jwt.token.verifySignature(artifacts, config.jwt.refreshTokenKey as string);
			const { payload } = artifacts.decoded;
			return payload;
		} catch (error) {
			throw new AuthenticationError("Unauthorized!");
		}
	}
}

export default TokenManager;
