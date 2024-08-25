import type { IOrder, IOrderWithUser } from "../../Common/models/types";
import CacheRepository from "../../Infrastructure/repositories/cache/cache.repository";
import AuthRepository from "../../Infrastructure/repositories/database/auth.repository";
import OrderRepository from "../../Infrastructure/repositories/database/order.repository";
import { v7 as uuidv7 } from "uuid";
import { InvariantError, AuthorizationError, NotFoundError } from "../../Common/errors";

interface IOrderService {
	addOrder(payload: IOrder): Promise<string>;
	getOrders(payload: Partial<IOrder>): Promise<IOrderWithUser[]>;
	deleteOrder(payload: Partial<IOrder>): Promise<void>;
}

class OrderService implements IOrderService {
	private _authRepository: AuthRepository;
	private _orderRepository: OrderRepository;
	private _cacheRepository: CacheRepository;

	constructor(
		authRepository: AuthRepository,
		orderRepository: OrderRepository,
		cacheRepository: CacheRepository
	) {
		this._authRepository = authRepository;
		this._orderRepository = orderRepository;
		this._cacheRepository = cacheRepository;
	}

	async addOrder(payload: IOrder): Promise<string> {
		if (!payload.userId || !payload.totalPrice) {
			throw new InvariantError("User ID and total price are required");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to add an order");
		}

		const id = uuidv7();
		const orderId = await this._orderRepository.addOrder({ ...payload, id });
		if (!orderId) {
			throw new InvariantError("Failed to add order");
		}

		await this._cacheRepository.delete({ key: `order:${payload.userId}` });

		return orderId;
	}

	async getOrders(payload: Partial<IOrder>): Promise<IOrderWithUser[]> {
		if (!payload.userId) {
			throw new InvariantError("User ID is required");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to access this order");
		}

		const cacheKey = `order:${payload.userId}`;
		const cachedData = await this._cacheRepository.get({ key: cacheKey });
		const orderResult = cachedData ? JSON.parse(cachedData) : null;
		
		if (orderResult) {
			return orderResult.map((order: IOrderWithUser) => ({ ...order, source: "cache" }));
		}

		const orders = await this._orderRepository.getOrderByUserId(payload);
		if (!orders) {
			throw new NotFoundError("Order not found");
		}

		await this._cacheRepository.set({ key: cacheKey, value: JSON.stringify(orders) });

		return orders.map(order => ({ ...order, source: "database" }));
	}

	async deleteOrder(payload: Partial<IOrder>): Promise<void> {
		const order = await this._orderRepository.VerifyOrderAccess({ id: payload.id });
		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.userId !== payload.userId) {
			throw new AuthorizationError("You are not allowed to delete this order");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to delete this order");
		}

		await this._orderRepository.deleteOrderById(payload);
		await this._cacheRepository.delete({ key: `order:${payload.userId}` });
	}
}

export default OrderService;
