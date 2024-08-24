import type { IOrder } from "../../../Common/models/interface";
import { v7 as uuidv7 } from "uuid";
import { Pool } from "pg";
import { InvariantError, NotFoundError, AuthorizationError } from "../../../Common/errors";

class OrderRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addOrder(order: IOrder): Promise<string> {
		const id = uuidv7();
		const orderQuery = {
			text: `
                INSERT INTO orders (id, user_id, total_price) 
                VALUES ($1, $2, $3) 
                RETURNING id
            `,
			values: [id, order.userId, order.totalPrice]
		};

		const orderResult = await this._pool.query(orderQuery);
		if (!orderResult.rowCount) {
			throw new InvariantError("Failed to add order");
		}
		return orderResult.rows[0].id;
	}

	async getOrderByUserId(order: Partial<IOrder>): Promise<any> {
		const orderQuery = {
			text: "SELECT id, total_price FROM orders WHERE user_id = $1",
			values: [order.userId]
		};

		const orderResult = await this._pool.query(orderQuery);
		if (!orderResult.rowCount) {
			throw new InvariantError("Failed to get order");
		}

		const userQuery = {
			text: `
				SELECT id, username, email, address, city, contact_number FROM users 
				WHERE id = $1
			`,
			values: [order.userId]
		};

		const userResult = await this._pool.query(userQuery);
		if (!userResult.rowCount) {
			throw new InvariantError("Failed to get user");
		}

		return {
			...orderResult.rows[0],
			user: userResult.rows[0]
		};
	}

	async VerifyOrderAccess(order: Partial<IOrder>): Promise<any> {
		const orderQuery = {
			text: "SELECT id, user_id FROM orders WHERE id = $1",
			values: [order.id]
		};

		const orderResult = await this._pool.query(orderQuery);
		if (!orderResult.rowCount) {
			throw new NotFoundError("Order not found");
		}

		if (orderResult.rows[0].user_id !== order.userId) {
			throw new AuthorizationError("You are not allowed to access this order");
		}
	}

	async deleteOrderById(order: Partial<IOrder>): Promise<any> {
		const orderQuery = {
			text: "DELETE FROM orders WHERE id = $1",
			values: [order.id]
		};

		const orderResult = await this._pool.query(orderQuery);
		if (!orderResult.rowCount) {
			throw new InvariantError("Failed to delete order");
		}
	}
}

export default OrderRepository;
