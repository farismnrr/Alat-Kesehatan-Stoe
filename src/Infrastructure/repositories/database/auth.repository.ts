import type { IAuth } from "../../../Common/models/interface";
import { Pool } from "pg";
import { InvariantError, AuthenticationError } from "../../../Common/errors";

interface IAuthRepository {
	// Start User Auth Service
	addUserRefreshToken(auth: IAuth): Promise<void>;
	verifyUserRefreshToken(auth: Partial<IAuth>): Promise<void>;
	deleteUserRefreshToken(auth: Partial<IAuth>): Promise<void>;
	// End User Auth Service

	// Start Admin Auth Service
	addAdminRefreshToken(auth: IAuth): Promise<void>;
	verifyAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	deleteAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	// End Admin Auth Service

	// Start Universal Repository
	verifyRole(auth: Partial<IAuth>): Promise<string>;
	// End Universal Repository
}

class AuthRepository implements IAuthRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	// Start User Auth Service
	async addUserRefreshToken(auth: IAuth): Promise<void> {
		const deleteUserQuery = {
			text: "DELETE FROM auths WHERE user_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteUserQuery);

		const authUserQuery = {
			text: "INSERT INTO auths (token, user_id, role) VALUES($1, $2, $3)",
			values: [auth.token, auth.id, auth.role]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyUserRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authUserQuery = {
			text: "SELECT token, role FROM auths WHERE token = $1 AND user_id = $2",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteUserRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authUserQuery = {
			text: "DELETE FROM auths WHERE token = $1 AND user_id = $2",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Refresh token is not valid");
		}
	}
	// End User Auth Service

	// Start Admin Auth Service
	async addAdminRefreshToken(auth: IAuth): Promise<void> {
		const deleteAdminQuery = {
			text: "DELETE FROM auths WHERE admin_id = $1",
			values: [auth.id]
		};

		await this._pool.query(deleteAdminQuery);

		const authAdminQuery = {
			text: "INSERT INTO auths (token, admin_id, role) VALUES($1, $2, $3)",
			values: [auth.token, auth.id, auth.role]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyAdminRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authAdminQuery = {
			text: "SELECT token, role FROM auths WHERE token = $1 AND admin_id = $2",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async deleteAdminRefreshToken(auth: Partial<IAuth>): Promise<void> {
		const authAdminQuery = {
			text: "DELETE FROM auths WHERE token = $1 AND admin_id = $2",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}
	// End Admin Auth Service

	// Start Universal Repository
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
