import type { IUser } from "../../../Domain/models/interface";
import { Pool } from "pg";

interface IUserRepository {
	verifyUsername(user: Partial<IUser>): Promise<string>;
	verifyEmail(user: Partial<IUser>): Promise<string>;
	addUser(user: IUser): Promise<string>;
	editUserById(user: IUser): Promise<string>;
	deleteUserById(user: Partial<IUser>): Promise<string>;
}

class UserRepository implements IUserRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(user: Partial<IUser>): Promise<string> {
		const userQuery = {
			text: "SELECT id, username, password FROM users WHERE username = $1",
			values: [user.username]
		};

		const userResult = await this._pool.query(userQuery);
		return userResult.rows[0];
	}

	async verifyEmail(user: Partial<IUser>): Promise<string> {
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

	async editUserById(user: IUser): Promise<string> {
		const userQuery = {
			text: `
				UPDATE users SET 
					username = $1, 
					password = $2, 
					email = $3, 
					birthdate = $4, 
					gender = $5, 
					address = $6, 
					city = $7, 
					contact_number = $8 
				WHERE id = $9 RETURNING id
            `,
			values: [
				user.username,
				user.password,
				user.email,
				user.birthdate,
				user.gender,
				user.address,
				user.city,
				user.contactNumber,
				user.id
			]
		};

		const userResult = await this._pool.query(userQuery);
		return userResult.rows[0];
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
