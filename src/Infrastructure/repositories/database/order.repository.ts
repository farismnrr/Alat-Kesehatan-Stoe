import type { IOrder, IOrderWithUser } from "../../../Common/models/types";
import { MapOrder, MapOrderWithUser } from "../../../Common/models/mapping";
import { Pool } from "pg";

interface IOrderRepository {
	addOrder(order: IOrder): Promise<string>;
	getOrderByUserId(order: Partial<IOrder>): Promise<IOrderWithUser[]>;
	VerifyOrderAccess(order: Partial<IOrder>): Promise<IOrder | null>;
	deleteOrderById(order: Partial<IOrder>): Promise<void>;
}

class OrderRepository implements IOrderRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addOrder(order: IOrder): Promise<string> {
		const orderQuery = {
			text: `
                INSERT INTO orders (id, user_id, total_price) 
                VALUES ($1, $2, $3) 
                RETURNING id
            `,
			values: [order.id, order.userId, order.totalPrice]
		};

		const orderResult = await this._pool.query(orderQuery);
		return orderResult.rows[0].id;
	}

	async getOrderByUserId(order: Partial<IOrder>): Promise<IOrderWithUser[]> {
		const orderQuery = {
			text: "SELECT id, total_price FROM orders WHERE user_id = $1",
			values: [order.userId]
		};
		const orderResult = await this._pool.query(orderQuery);

		const userQuery = {
			text: `
				SELECT id, username, email, birthdate, gender, address, city, contact_number 
				FROM users 
				WHERE id = $1
			`,
			values: [order.userId]
		};
		const userResult = await this._pool.query(userQuery);
		return orderResult.rows.map(order => MapOrderWithUser(order, userResult.rows[0]));
	}

	async VerifyOrderAccess(order: Partial<IOrder>): Promise<IOrder | null> {
		const orderQuery = {
			text: "SELECT id, user_id FROM orders WHERE id = $1",
			values: [order.id]
		};

		const orderResult = await this._pool.query(orderQuery);
		return orderResult.rows[0] ? MapOrder(orderResult.rows[0]) : null;
	}

	async deleteOrderById(order: Partial<IOrder>): Promise<void> {
		const orderQuery = {
			text: "DELETE FROM orders WHERE id = $1",
			values: [order.id]
		};

		await this._pool.query(orderQuery);
	}
}

export default OrderRepository;
