import bcrypt from "bcrypt";

import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../../error/NotFoundError";
import { InvariantError } from "../../error/InvariantError";
import { AuthenticationError, AuthorizationError } from "../../error/AuthError";

class UserService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(username: string) {
		const userQuery = {
			text: "SELECT username FROM users WHERE username = $1",
			values: [username]
		};

		const userResult = await this._pool.query(userQuery);
		if (userResult.rowCount) {
			throw new InvariantError("Username already exists");
		}
	}

	async verifyUserCredential(username: string, password: string) {
		const userQuery = {
			text: "SELECT id, password FROM users WHERE username = $1",
			values: [username]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("Username not found");
		}

		const user = userResult.rows[0];
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return user.id;
	}

	async addUser({
		username,
		password,
		email,
		birthdate,
		gender,
		address,
		city,
		contact_number
	}: {
		username: string;
		password: string;
		email: string;
		birthdate: Date;
		gender: string;
		address: string;
		city: string;
		contact_number: string;
	}) {
		await this.verifyUsername(username);

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(password, 10);
		const userQuery = {
			text: `
              INSERT INTO users (id, username, password, email, birthdate, gender, address, city, contact_number)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING id
            `,
			values: [
				id,
				username,
				hashedPassword,
				email,
				birthdate,
				gender,
				address,
				city,
				contact_number
			]
		};

		const result = await this._pool.query(userQuery);
		return result.rows[0].id;
	}

	async editUserById(
		id: string,
		role: string,
		{ username, password, email, birthdate, gender, address, city, contact_number }: any
	) {
		const hashedPassword = await bcrypt.hash(password, 10);
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
				username,
				hashedPassword,
				email,
				birthdate,
				gender,
				address,
				city,
				contact_number,
				id
			]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("User not found");
		}

		if (role !== "user") {
			throw new AuthorizationError("Forbidden");
		}

		return userResult.rowCount;
	}

	async deleteUserById(id: string, role: string) {
		const userQuery = {
			text: "DELETE FROM users WHERE id = $1 RETURNING id",
			values: [id]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("User not found");
		}

		if (role !== "user") {
			throw new AuthorizationError("Forbidden");
		}
	}
}

export default UserService;
