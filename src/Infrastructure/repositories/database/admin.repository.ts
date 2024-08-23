import type { IAdmin } from "../../../Common/models/interface";
import { Pool } from "pg";

interface IAdminRepository {
	verifyUsername(admin: Partial<IAdmin>): Promise<IAdmin>;
	verifyEmail(admin: Partial<IAdmin>): Promise<IAdmin>;
	addAdmin(admin: IAdmin): Promise<string>;
	editAdminById(admin: IAdmin): Promise<void>;
	deleteAdminById(admin: Partial<IAdmin>): Promise<void>;
}

class AdminRepository implements IAdminRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(admin: Partial<IAdmin>): Promise<IAdmin> {
		const adminQuery = {
			text: "SELECT id, username, password FROM admins WHERE username = $1",
			values: [admin.username]
		};

		const adminResult = await this._pool.query(adminQuery);
		return adminResult.rows[0];
	}

	async verifyEmail(admin: Partial<IAdmin>): Promise<IAdmin> {
		const adminQuery = {
			text: "SELECT id, email, password FROM admins WHERE email = $1",
			values: [admin.email]
		};

		const adminResult = await this._pool.query(adminQuery);
		return adminResult.rows[0];
	}

	async addAdmin(admin: IAdmin): Promise<string> {
		const adminQuery = {
			text: `
				INSERT INTO admins (id, username, password, email)
				VALUES ($1, $2, $3, $4)
				RETURNING id
            `,
			values: [admin.id, admin.username, admin.password, admin.email]
		};

		const adminResult = await this._pool.query(adminQuery);
		return adminResult.rows[0].id;
	}

	async editAdminById(admin: IAdmin): Promise<void> {
		let fields: string[] = [];
		let values: any[] = [];
		let index = 1;

		if (admin.username) {
			fields.push(`username = $${index++}`);
			values.push(admin.username);
		}

		if (admin.password) {
			fields.push(`password = $${index++}`);
			values.push(admin.password);
		}

		if (admin.email) {
			fields.push(`email = $${index++}`);
			values.push(admin.email);
		}

		if (fields.length === 0) {
			throw new Error("Payload is empty");
		}

		const adminQuery = {
			text: `
				UPDATE admins 
				SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
				WHERE id = $${index}
				RETURNING id
				`,
			values: [...values, admin.id]
		};

		await this._pool.query(adminQuery);
	}

	async deleteAdminById(admin: Partial<IAdmin>): Promise<void> {
		const adminQuery = {
			text: "DELETE FROM admins WHERE id = $1 RETURNING id",
			values: [admin.id]
		};

		await this._pool.query(adminQuery);
	}
}

export default AdminRepository;
