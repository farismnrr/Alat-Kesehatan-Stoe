import type { IOrder, IOrderMap } from "../../../Common/models/types";
import { Pool } from "pg";
import { MapOrder } from "../../../Common/models/mapping";

interface IOrderRepository {
	// Start Order Repository
	addOrder(order: IOrder): Promise<string>;
	getOrderByUserId(order: Partial<IOrder>): Promise<any>;
	VerifyOrderAccess(order: Partial<IOrder>): Promise<IOrderMap | null>;
	deleteOrderById(order: Partial<IOrder>): Promise<void>;
	// End Order Repository

	// Start Order Item Repository
	// End Order Item Repository
}

class OrderRepository implements IOrderRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	// Start Order Repository
	async addOrder(order: IOrder): Promise<string> {
		const orderQuery = {
			text: `
                INSERT INTO orders (id, user_id) 
                VALUES ($1, $2) 
                RETURNING id
            `,
			values: [order.id, order.userId]
		};

		const orderResult = await this._pool.query(orderQuery);
		return orderResult.rows[0].id;
	}

	async getOrderByUserId(order: Partial<IOrder>): Promise<IOrderMap[]> {
		const orderQuery = {
			text: "SELECT id, user_id FROM orders WHERE user_id = $1",
			values: [order.userId]
		};

		const orderResult = await this._pool.query(orderQuery);
		return orderResult.rows.map(MapOrder);
	}

	async VerifyOrderAccess(order: Partial<IOrder>): Promise<IOrderMap | null> {
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
	// End Order Repository

	// Start Order Item Repository
	async addOrderItem(orderItem: any): Promise<string> {
		const orderItemQuery = {
			text: `
			  INSERT INTO order_items (id, order_id, product_id, quantity, subtotal)
			  SELECT $1, $2, p.id, $3::integer, (p.price * $3::integer)::numeric
			  FROM products p
			  WHERE p.id = $4
			  RETURNING id
			`,
			values: [orderItem.id, orderItem.orderId, orderItem.quantity, orderItem.productId]
		};
		const orderItemResult = await this._pool.query(orderItemQuery);
		return orderItemResult.rows[0].id;
	}

	async getOrderItemsByOrderId(orderItem: Partial<any>): Promise<any | null> {
		const orderItemQuery = {
			text: "SELECT id, order_id, quantity, subtotal FROM order_items WHERE order_id = $1",
			values: [orderItem]
		};

		const orderItemResult = await this._pool.query(orderItemQuery);
		return orderItemResult.rows ? orderItemResult.rows : null;
	}

	async getOrderItemById(orderItem: Partial<any>): Promise<any | null> {
		const orderItemQuery = {
			text: "SELECT id, order_id, quantity, subtotal FROM order_items WHERE id = $1",
			values: [orderItem.id]
		};

		const orderItemResult = await this._pool.query(orderItemQuery);
		return orderItemResult.rows[0] ? orderItemResult.rows[0] : null;
	}

	async deleteOrderItem(orderItem: Partial<any>): Promise<void> {
		const orderItemQuery = {
			text: "DELETE FROM order_items WHERE id = $1",
			values: [orderItem.id]
		};

		await this._pool.query(orderItemQuery);
	}
	// End Order Item Repository
}

export default OrderRepository;
