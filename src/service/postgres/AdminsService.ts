import bcrypt from "bcrypt";

import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../../error/NotFoundError";
import { InvariantError } from "../../error/InvariantError";
import { AuthenticationError, AuthorizationError } from "../../error/AuthError";

class AdminService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(username: string) {
		const adminQuery = {
			text: "SELECT username FROM admins WHERE username = $1",
			values: [username]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (adminResult.rowCount) {
			throw new InvariantError("Username already exists");
		}
	}

	async verifyAdminCredential(username: string, password: string) {
		const adminQuery = {
			text: "SELECT id, password FROM admins WHERE username = $1",
			values: [username]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Username not found");
		}

		const admin = adminResult.rows[0];
		const match = await bcrypt.compare(password, admin.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return admin.id;
	}

	async addAdmin({
		username,
		password,
		email
	}: {
		username: string;
		password: string;
		email: string;
	}) {
		await this.verifyUsername(username);

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(password, 10);
		const adminQuery = {
			text: `
              INSERT INTO admins (id, username, password, email)
              VALUES ($1, $2, $3, $4)
              RETURNING id
            `,
			values: [id, username, hashedPassword, email]
		};

		const adminResult = await this._pool.query(adminQuery);
		return adminResult.rows[0].id;
	}

	async editAdminById(id: string, role: string, { username, password, email }: any) {
		const hashedPassword = await bcrypt.hash(password, 10);
		const adminQuery = {
			text: `
            UPDATE admins SET username = $1, password = $2, email = $3 
            WHERE id = $4 
            RETURNING id
            `,
			values: [username, hashedPassword, email, id]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Admin not found");
		}

		if (role !== "admin") {
			throw new AuthorizationError("Forbidden");
		}
	}

	async deleteAdminById(id: string, role: string) {
		const adminQuery = {
			text: "DELETE FROM admins WHERE id = $1 RETURNING id",
			values: [id]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Admin not found");
		}

		if (role !== "admin") {
			throw new AuthorizationError("Forbidden");
		}
	}
}

export default AdminService;
