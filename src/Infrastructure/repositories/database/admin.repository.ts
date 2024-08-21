import type { IAdmin, IRole } from "../../../Domain/models/interface";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import {
	InvariantError,
	NotFoundError,
	AuthenticationError,
	AuthorizationError
} from "../../../Common/errors";

interface IAdminRepository {
	verifyUsername(admin: Partial<IAdmin>): Promise<void>;
	verifyAdminCredential(admin: IAdmin): Promise<string>;
	addAdmin(admin: IAdmin): Promise<string>;
	editAdminById(adminRole: IRole, admin: IAdmin): Promise<void>;
	deleteAdminById(adminRole: IRole): Promise<void>;
}

class AdminRepository implements IAdminRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(admin: Partial<IAdmin>): Promise<void> {
		const adminQuery = {
			text: "SELECT username FROM admins WHERE username = $1",
			values: [admin.username]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (adminResult.rowCount) {
			throw new InvariantError("Username already exists");
		}
	}

	async verifyAdminCredential(admin: Partial<IAdmin>): Promise<string> {
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

	async addAdmin(admin: IAdmin): Promise<string> {
		await this.verifyUsername({ username: admin.username });

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(admin.password, 10);
		const adminQuery = {
			text: `
              INSERT INTO admins (id, username, password, email)
              VALUES ($1, $2, $3, $4)
              RETURNING id
            `,
			values: [id, admin.username, hashedPassword, admin.email]
		};

		const adminResult = await this._pool.query(adminQuery);
		return adminResult.rows[0].id;
	}

	async editAdminById(adminRole: IRole, admin: IAdmin): Promise<void> {
		const hashedPassword = admin.password ? await bcrypt.hash(admin.password, 10) : undefined;
		const adminQuery = {
			text: `
            UPDATE admins SET username = $1, password = $2, email = $3 
            WHERE id = $4 
            RETURNING id
            `,
			values: [admin.username, hashedPassword, admin.email, adminRole.id]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Admin not found");
		}

		if (adminRole.role !== "admin") {
			throw new AuthorizationError("Forbidden");
		}
	}

	async deleteAdminById(adminRole: IRole): Promise<void> {
		const adminQuery = {
			text: "DELETE FROM admins WHERE id = $1 RETURNING id",
			values: [adminRole.id]
		};

		const adminResult = await this._pool.query(adminQuery);
		if (!adminResult.rowCount) {
			throw new NotFoundError("Admin not found");
		}

		if (adminRole.role !== "admin") {
			throw new AuthorizationError("Forbidden");
		}
	}
}

export default AdminRepository;