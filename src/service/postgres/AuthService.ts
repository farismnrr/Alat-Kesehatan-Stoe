import { Pool } from "pg";
import { InvariantError } from "../../error/InvariantError";
import { AuthenticationError } from "../../error/AuthError";

class AuthService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	// Start User Auth Service
	async addUserRefreshToken(token: string, userId: string) {
		const deleteUserQuery = {
			text: "DELETE FROM auth WHERE user_id = $1",
			values: [userId]
		};

		await this._pool.query(deleteUserQuery);

		const authUserQuery = {
			text: "INSERT INTO auth (token, user_id) VALUES($1, $2)",
			values: [token, userId]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyUserRefreshToken(token: string, userId: string) {
		const authUserQuery = {
			text: "SELECT token FROM auth WHERE token = $1 AND user_id = $2",
			values: [token, userId]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteUserRefreshToken(token: string, userId: string) {
		const authUserQuery = {
			text: "DELETE FROM auth WHERE token = $1 AND user_id = $2",
			values: [token, userId]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Refresh token is not valid");
		}
	}
	// End User Auth Service

	// Start Admin Auth Service
	async addAdminRefreshToken(token: string, adminId: string) {
		const deleteAdminQuery = {
			text: "DELETE FROM auth WHERE admin_id = $1",
			values: [adminId]
		};

		await this._pool.query(deleteAdminQuery);

		const authAdminQuery = {
			text: "INSERT INTO auth (token, admin_id) VALUES($1, $2)",
			values: [token, adminId]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyAdminRefreshToken(token: string, adminId: string) {
		const authAdminQuery = {
			text: "SELECT token FROM auth WHERE token = $1 AND admin_id = $2",
			values: [token, adminId]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteAdminRefreshToken(token: string, adminId: string) {
		const authAdminQuery = {
			text: "DELETE FROM auth WHERE token = $1 AND admin_id = $2",
			values: [token, adminId]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}
	// End Admin Auth Service
}

export default AuthService;
