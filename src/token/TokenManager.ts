import Jwt from "@hapi/jwt";
import config from "../utils/config";
import { InvariantError } from "../error/InvariantError";

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
		if (!config.jwt.refreshTokenKey) {
			throw new InvariantError("Refresh token key is invalid.");
		}
		const artifacts = Jwt.token.decode(refreshToken);
		Jwt.token.verifySignature(artifacts, config.jwt.refreshTokenKey);
		const { payload } = artifacts.decoded;
		return payload;
	}
}

export default TokenManager;
