import type { IOrder } from "../../../Common/models/interface";
import { Pool } from "pg";

class OrderRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addOrder(order: IOrder): Promise<string> {
		const orderQuery = {
			text: `
                INSERT INTO orders (id, user_id, quantity, total_price, status) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING id
            `,
			values: [order.id, order.userId, order.quantity, order.totalPrice, order.status]
		};

		const orderResult = await this._pool.query(orderQuery);
		return orderResult.rows[0].id;
	}
}
