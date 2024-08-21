import type { IUser, IAuth } from "../../../Domain/models/interface";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import {
	NotFoundError,
	InvariantError,
	AuthenticationError,
	AuthorizationError
} from "../../../Common/errors";

interface IUserRepository {
	verifyUsername(user: Partial<IUser>): Promise<void>;
	verifyUserCredential(user: Partial<IUser>): Promise<string>;
	addUser(user: IUser): Promise<string>;
	editUserById(userRole: IAuth, user: IUser): Promise<void>;
	deleteUserById(userRole: IAuth): Promise<void>;
}

class UserRepository implements IUserRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async verifyUsername(user: Partial<IUser>): Promise<void> {
		const userQuery = {
			text: "SELECT username FROM users WHERE username = $1",
			values: [user.username]
		};

		const userResult = await this._pool.query(userQuery);
		if (userResult.rowCount) {
			throw new InvariantError("Username already exists");
		}
	}

	async verifyUserCredential(user: Partial<IUser>): Promise<string> {
		const userQuery = {
			text: "SELECT id, password FROM users WHERE username = $1",
			values: [user.username]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("Username not found");
		}

		const userData = userResult.rows[0];
		const match = await bcrypt.compare(user.password || "", userData.password);
		if (!match) {
			throw new AuthenticationError("Username or password is incorrect");
		}

		return userData.id;
	}

	async addUser(user: IUser): Promise<string> {
		await this.verifyUsername(user);

		const id = uuidv4();
		const hashedPassword = await bcrypt.hash(user.password, 10);
		const userQuery = {
			text: `
              INSERT INTO users (id, username, password, email, birthdate, gender, address, city, contact_number)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING id
            `,
			values: [
				id,
				user.username,
				hashedPassword,
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

	async editUserById(userRole: IAuth, user: IUser): Promise<void> {
		const hashedPassword = await bcrypt.hash(user.password, 10);
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
				hashedPassword,
				user.email,
				user.birthdate,
				user.gender,
				user.address,
				user.city,
				user.contactNumber,
				userRole.id
			]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("User not found");
		}

		if (userRole.role !== "user") {
			throw new AuthorizationError("Forbidden");
		}
	}

	async deleteUserById(userRole: IAuth): Promise<void> {
		const userQuery = {
			text: "DELETE FROM users WHERE id = $1 RETURNING id",
			values: [userRole.id]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new NotFoundError("User not found");
		}

		if (userRole.role !== "user") {
			throw new AuthorizationError("Forbidden");
		}
	}
}

export default UserRepository;
