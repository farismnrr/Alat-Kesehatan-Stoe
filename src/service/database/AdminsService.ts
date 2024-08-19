import bcrypt from "bcrypt";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../../error/NotFoundError";
import { InvariantError } from "../../error/InvariantError";
import { AuthenticationError, AuthorizationError } from "../../error/AuthError";

interface Admin {
	id: string;
	username: string;
	password: string;
	email: string;
}

interface AdminRole {
	id: string;
	role: string;
}

// Interface untuk AdminService
interface IAdminService {
	verifyUsername(admin: Partial<Admin>): Promise<void>;
	verifyAdminCredential(admin: Partial<Admin>): Promise<string>;
	addAdmin(admin: Admin): Promise<string>;
	editAdminById(adminRole: AdminRole, admin: Partial<Admin>): Promise<void>;
	deleteAdminById(adminRole: AdminRole): Promise<void>;
}

// Implementasi AdminService
class AdminService implements IAdminService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(admin: Partial<Admin>): Promise<void> {
		const adminQuery = {
			text: "SELECT username FROM admins WHERE username = $1",
			values: [admin.username]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (adminResult.rowCount) {
			throw new InvariantError("Username already exists");
		}
	}

	async verifyAdminCredential(admin: Partial<Admin>): Promise<string> {
		const adminQuery = {
			text: "SELECT id, password FROM admins WHERE username = $1",
			values: [admin.username]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Username not found");
		}

		const adminData = adminResult.rows[0];
		const match = await bcrypt.compare(admin.password || "", adminData.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return adminData.id;
	}

	async addAdmin({ username, password, email }: Admin): Promise<string> {
		await this.verifyUsername({ username });

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

	async editAdminById(
		{ id, role }: AdminRole,
		{ username, password, email }: Partial<Admin>
	): Promise<void> {
		const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
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

	async deleteAdminById({ id, role }: AdminRole): Promise<void> {
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
