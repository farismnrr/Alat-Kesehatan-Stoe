import type { IUser } from "../../../Common/models/interface";
import { Pool } from "pg";

interface IUserRepository {
	verifyUsername(user: Partial<IUser>): Promise<IUser>;
	verifyEmail(user: Partial<IUser>): Promise<IUser>;
	addUser(user: IUser): Promise<string>;
	editUserById(user: IUser): Promise<void>;
	deleteUserById(user: Partial<IUser>): Promise<string>;
}

class UserRepository implements IUserRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(user: Partial<IUser>): Promise<IUser> {
		const userQuery = {
			text: "SELECT id, username, password FROM users WHERE username = $1",
			values: [user.username]
		};

		const userResult = await this._pool.query(userQuery);
		return userResult.rows[0];
	}

	async verifyEmail(user: Partial<IUser>): Promise<IUser> {
		const userQuery = {
			text: "SELECT id, email, password FROM users WHERE email = $1",
			values: [user.email]
		};

		const userResult = await this._pool.query(userQuery);
		return userResult.rows[0];
	}

	async addUser(user: IUser): Promise<string> {
		const userQuery = {
			text: `
				INSERT INTO users (
					id, 
					username, 
					password, 
					email, 
					birthdate, 
					gender, 
					address, 
					city, 
					contact_number
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				RETURNING id
            `,
			values: [
				user.id,
				user.username,
				user.password,
				user.email,
				user.birthdate,
				user.gender,
				user.address,
				user.city,
				user.contactNumber
			]
		};

		const result = await this._pool.query(userQuery);
		return result.rows[0].id;
	}

	async editUserById(user: IUser): Promise<void> {
		let fields: string[] = [];
		let values: any[] = [];
		let index = 1;

		if (user.username) {
			fields.push(`username = $${index++}`);
			values.push(user.username);
		}

		if (user.password) {
			fields.push(`password = $${index++}`);
			values.push(user.password);
		}

		if (user.email) {
			fields.push(`email = $${index++}`);
			values.push(user.email);
		}

		if (user.birthdate) {
			fields.push(`birthdate = $${index++}`);
			values.push(user.birthdate);
		}

		if (user.gender) {
			fields.push(`gender = $${index++}`);
			values.push(user.gender);
		}

		if (user.address) {
			fields.push(`address = $${index++}`);
			values.push(user.address);
		}

		if (user.city) {
			fields.push(`city = $${index++}`);
			values.push(user.city);
		}

		if (user.contactNumber) {
			fields.push(`contact_number = $${index++}`);
			values.push(user.contactNumber);
		}

		if (fields.length === 0) {
			throw new Error("Payload is empty");
		}

		const userQuery = {
			text: `
				UPDATE users 
				SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
				WHERE id = $${index}
				RETURNING id
				`,
			values: [...values, user.id]
		};

		await this._pool.query(userQuery);
	}

	async deleteUserById(user: Partial<IUser>): Promise<string> {
		const userQuery = {
			text: "DELETE FROM users WHERE id = $1 RETURNING id",
			values: [user.id]
		};

		const userResult = await this._pool.query(userQuery);
		return userResult.rows[0];
	}
}

export default UserRepository;
