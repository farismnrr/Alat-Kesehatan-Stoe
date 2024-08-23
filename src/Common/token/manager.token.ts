import Jwt from "@hapi/jwt";
import config from "../../Infrastructure/settings/config";
import { InvariantError, AuthenticationError } from "../../Common/errors";
import type { IAuthToken } from "../../Common/models/interface";

class TokenManager {
	generateAccessToken(payload: Partial<IAuthToken>): string {
		if (!config.jwt.accessTokenKey) {
			throw new InvariantError("Access token key is invalid.");
		}
		return Jwt.token.generate(payload, config.jwt.accessTokenKey);
	}

	generateRefreshToken(payload: Partial<IAuthToken>): string {
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
			return payload.id;
		} catch (error) {
			throw new AuthenticationError("Access denied!");
		}
	}
}

export default TokenManager;
