import type { IAuth } from "../../../Common/models/types";
import { Pool } from "pg";
import { InvariantError, AuthenticationError } from "../../../Common/errors";

interface IAuthRepository {
	// Start User Auth Repository
	addUserRefreshToken(auth: IAuth): Promise<void>;
	verifyUserRefreshToken(auth: Partial<IAuth>): Promise<void>;
	updateUserAccessToken(auth: Partial<IAuth>): Promise<void>;
	deleteUserRefreshToken(auth: Partial<IAuth>): Promise<void>;
	// End User Auth Repository

	// Start Admin Auth Repository
	addAdminRefreshToken(auth: IAuth): Promise<void>;
	verifyAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	updateAdminAccessToken(auth: Partial<IAuth>): Promise<void>;
	deleteAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	// End Admin Auth Repository

	// Start Universal Auth Repository
	verifyRole(auth: Partial<IAuth>): Promise<string>;
	// End Universal Auth Repository
}

class AuthRepository implements IAuthRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	// Start User Auth Repository
	async addUserRefreshToken(auth: IAuth): Promise<void> {
		const deleteUserQuery = {
			text: "DELETE FROM auths WHERE user_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteUserQuery);

		const authUserQuery = {
			text: "INSERT INTO auths (refresh_token, access_token, user_id, role) VALUES($1, $2, $3, $4)",
			values: [auth.refreshToken, auth.accessToken, auth.id, auth.role]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyUserRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authUserQuery = {
			text: "SELECT refresh_token, role FROM auths WHERE refresh_token = $1 AND user_id = $2",
			values: [auth.refreshToken, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async updateUserAccessToken(auth: Partial<IAuth>): Promise<void> {
		const authUserQuery = {
			text: `
				UPDATE auths SET access_token = $1, updated_at = CURRENT_TIMESTAMP 
				WHERE user_id = $2
			`,
			values: [auth.accessToken, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to update access token");
		}
	}

	async deleteUserRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authUserQuery = {
			text: "DELETE FROM auths WHERE refresh_token = $1 AND user_id = $2",
			values: [auth.refreshToken, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Refresh token is not valid");
		}
	}
	// End User Auth Repository

	// Start Admin Auth Repository
	async addAdminRefreshToken(auth: IAuth): Promise<void> {
		const deleteAdminQuery = {
			text: "DELETE FROM auths WHERE admin_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteAdminQuery);

		const authAdminQuery = {
			text: "INSERT INTO auths (refresh_token, access_token, admin_id, role) VALUES($1, $2, $3, $4)",
			values: [auth.refreshToken, auth.accessToken, auth.id, auth.role]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyAdminRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authAdminQuery = {
			text: "SELECT refresh_token, role FROM auths WHERE refresh_token = $1 AND admin_id = $2",
			values: [auth.refreshToken, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async updateAdminAccessToken(auth: Partial<IAuth>): Promise<void> {
		const authAdminQuery = {
			text: `
				UPDATE auths SET access_token = $1, updated_at = CURRENT_TIMESTAMP 
				WHERE admin_id = $2
			`,
			values: [auth.accessToken, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to update access token");
		}
	}

	async deleteAdminRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authAdminQuery = {
			text: "DELETE FROM auths WHERE refresh_token = $1 AND admin_id = $2",
			values: [auth.refreshToken, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}
	// End Admin Auth Repository

	// Start Universal Auth Repository
	async verifyRole(auth: Partial<IAuth>): Promise<string> {
		const userQuery = {
			text: "SELECT role FROM auths WHERE user_id = $1",
			values: [auth.id]
		};

		const adminQuery = {
			text: "SELECT role FROM auths WHERE admin_id = $1",
			values: [auth.id]
		};

		const userResult = await this._pool.query(userQuery);
		const adminResult = await this._pool.query(adminQuery);

		if (userResult.rowCount) {
			return userResult.rows[0].role;
		} else if (adminResult.rowCount) {
			return adminResult.rows[0].role;
		} else {
			throw new AuthenticationError("Unauthorized!");
		}
	}
	// End Universal Repository
}

export default AuthRepository;
