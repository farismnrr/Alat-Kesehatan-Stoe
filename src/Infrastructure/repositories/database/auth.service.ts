import type { IAuth } from "../../../Domain/models";
import { Pool } from "pg";
import { InvariantError, AuthenticationError } from "../../../Common/errors";

interface IAuthService {
	// Start User Auth Service
	addUserRefreshToken(auth: IAuth): Promise<void>;
	verifyUserRefreshToken(auth: IAuth): Promise<void>;
	deleteUserRefreshToken(auth: IAuth): Promise<void>;
	// End User Auth Service

	// Start Admin Auth Service
	addAdminRefreshToken(auth: IAuth): Promise<void>;
	verifyAdminRefreshToken(auth: IAuth): Promise<void>;
	deleteAdminRefreshToken(auth: IAuth): Promise<void>;
	// End Admin Auth Service
}

class AuthService implements IAuthService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	// Start User Auth Service
	async addUserRefreshToken(auth: IAuth) {
		const deleteUserQuery = {
			text: "DELETE FROM auth WHERE user_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteUserQuery);

		const authUserQuery = {
			text: "INSERT INTO auth (token, user_id) VALUES($1, $2)",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyUserRefreshToken(auth: IAuth) {
		const authUserQuery = {
			text: "SELECT token FROM auth WHERE token = $1 AND user_id = $2",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteUserRefreshToken(auth: IAuth) {
		const authUserQuery = {
			text: "DELETE FROM auth WHERE token = $1 AND user_id = $2",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Refresh token is not valid");
		}
	}
	// End User Auth Service

	// Start Admin Auth Service
	async addAdminRefreshToken(auth: IAuth) {
		const deleteAdminQuery = {
			text: "DELETE FROM auth WHERE admin_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteAdminQuery);

		const authAdminQuery = {
			text: "INSERT INTO auth (token, admin_id) VALUES($1, $2)",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyAdminRefreshToken(auth: IAuth) {
		const authAdminQuery = {
			text: "SELECT token FROM auth WHERE token = $1 AND admin_id = $2",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteAdminRefreshToken(auth: IAuth) {
		const authAdminQuery = {
			text: "DELETE FROM auth WHERE token = $1 AND admin_id = $2",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}
	// End Admin Auth Service
}

export default AuthService;
