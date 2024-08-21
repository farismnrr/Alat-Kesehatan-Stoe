import type { IAuth } from "../../../Domain/models/interface";
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
	verifyAdminRole(auth: Partial<IAuth>): Promise<string>;
	verifyAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	deleteAdminRefreshToken(auth: Partial<IAuth>): Promise<void>;
	// End Admin Auth Service
}

class AuthRepository implements IAuthRepository {
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
			text: "INSERT INTO auth (token, user_id, role) VALUES($1, $2, $3)",
			values: [auth.token, auth.id, auth.role]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyUserRefreshToken(auth: Partial<IAuth>) {
		const authUserQuery = {
			text: "SELECT token, role FROM auth WHERE token = $1 AND user_id = $2",
			values: [auth.token, auth.id]
		};

		const authUserResult = await this._pool.query(authUserQuery);
		if (!authUserResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async verifyUserRole(auth: Partial<IAuth>): Promise<string> {
		const authQuery = {
			text: "SELECT role FROM auth WHERE user_id = $1",
			values: [auth.id]
		};
		
		const authResult = await this._pool.query(authQuery);
		return authResult.rows[0].role;
	}

	async deleteUserRefreshToken(auth: Partial<IAuth>) {
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
			text: "INSERT INTO auth (token, admin_id, role) VALUES($1, $2, $3)",
			values: [auth.token, auth.id, auth.role]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new InvariantError("Failed to add refresh token");
		}
	}

	async verifyAdminRefreshToken(auth: Partial<IAuth>) {
		const authAdminQuery = {
			text: "SELECT token, role FROM auth WHERE token = $1 AND admin_id = $2",
			values: [auth.token, auth.id]
		};

		const authAdminResult = await this._pool.query(authAdminQuery);
		if (!authAdminResult.rowCount) {
			throw new AuthenticationError("Unauthorized!");
		}
	}

	async verifyAdminRole(auth: Partial<IAuth>): Promise<string> {
		const authQuery = {
			text: "SELECT role FROM auth WHERE admin_id = $1",
			values: [auth.id]
		};
		
		const authResult = await this._pool.query(authQuery);
		return authResult.rows[0].role;
	}

	async deleteAdminRefreshToken(auth: Partial<IAuth>) {
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

export default AuthRepository;
