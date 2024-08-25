import type { IOrder } from "../../Common/models/types";
import CacheRepository from "../../Infrastructure/repositories/cache/cache.repository";
import AuthRepository from "../../Infrastructure/repositories/database/auth.repository";
import OrderRepository from "../../Infrastructure/repositories/database/order.repository";
import { v7 as uuidv7 } from "uuid";
import { InvariantError, AuthorizationError, NotFoundError } from "../../Common/errors";

interface IOrderService {
	// Start Order Service
	addOrder(payload: Partial<IOrder>): Promise<string>;
	getOrders(payload: Partial<IOrder>): Promise<any>;
	deleteOrder(payload: Partial<IOrder>): Promise<void>;
	// End Order Service

	// TODO: Create the interface for the order item service
	// Start Order Item Service
	// addOrderItem(payload: IOrderItem): Promise<string>;
	// deleteOrderItem(payload: Partial<IOrderItem>): Promise<void>;
	// End Order Item Service
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

	// Start Order Service
	async addOrder(payload: Partial<IOrder>): Promise<string> {
		if (!payload.userId) {
			throw new InvariantError("User ID is required");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to add an order");
		}

		const id = uuidv7();
		const orderId = await this._orderRepository.addOrder({ userId: payload.userId, id });
		if (!orderId) {
			throw new InvariantError("Failed to add order");
		}

		await this._cacheRepository.delete({ key: `order:${payload.userId}` });

		return orderId;
	}

	// TODO: Create Interface for getOrders Promise
	async getOrders(payload: Partial<IOrder>): Promise<any> {
		if (!payload.userId) {
			throw new InvariantError("User ID is required");
		}

		const cacheKey = `order:${payload.userId}`;
		const cachedData = await this._cacheRepository.get({ key: cacheKey });
		const orderResult = cachedData ? JSON.parse(cachedData) : null;
		if (orderResult) {
			return {
				orders: orderResult,
				source: "cache"
			};
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to access this order");
		}

		const orders = await this._orderRepository.getOrderByUserId(payload);
		if (!orders) {
			throw new NotFoundError("Order not found");
		}

		await this._cacheRepository.set({ key: cacheKey, value: JSON.stringify(orders) });

		return {
			orders: orders,
			source: "database"
		};
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
	// End Order Service

	// TODO: Create Interface for addOrderItem Payload
	// Start Order Item Service
	async addOrderItem(payload: any, orderId: string, userId: string): Promise<string> {
		if (!orderId || !payload.productId || !payload.quantity) {
			throw new InvariantError("Order ID, product ID, and quantity are required");
		}

		const order = await this._orderRepository.VerifyOrderAccess({ id: orderId });
		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.userId !== userId) {
			throw new AuthorizationError("You are not allowed to add an order item to this order");
		}

		const role = await this._authRepository.verifyRole({ id: userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to add an order item");
		}

		const orderItemId = uuidv7();
		const orderItem = await this._orderRepository.addOrderItem({
			...payload,
			id: orderItemId,
			orderId
		});
		if (!orderItem) {
			throw new InvariantError("Failed to add order item");
		}

		return orderItemId;
	}

	// TODO: Create Interface for getOrderItems Payload and Promise
	async getOrderItems(payload: Partial<any>): Promise<any> {
		if (!payload.orderId) {
			throw new InvariantError("Order ID is required");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to access this order");
		}

		const order = await this._orderRepository.VerifyOrderAccess({ id: payload.orderId });
		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.userId !== payload.userId) {
			throw new AuthorizationError("You are not allowed to access this order");
		}

		const orderItems = await this._orderRepository.getOrderItemsByOrderId(payload.orderId);
		if (!orderItems) {
			throw new NotFoundError("Order items not found");
		}

		return {
			userId: payload.userId,
			orderId: payload.orderId,
			items: orderItems // TODO: Create a mapping function to map the order items
		};
	}

	// TODO: Create Interface for deleteOrderItem Payload
	async deleteOrderItem(payload: Partial<any>): Promise<void> {
		if (!payload.id || !payload.userId) {
			throw new InvariantError("Order ID and user ID are required");
		}

		const role = await this._authRepository.verifyRole({ id: payload.userId });
		if (role !== "user") {
			throw new AuthorizationError("You are not authorized to access this order");
		}

		const order = await this._orderRepository.VerifyOrderAccess({ id: payload.orderId });
		if (!order) {
			throw new NotFoundError("Order not found");
		}

		if (order.userId !== payload.userId) {
			throw new AuthorizationError("You are not allowed to access this order");
		}

		const orderItem = await this._orderRepository.getOrderItemById({ id: payload.id });
		if (!orderItem) {
			throw new NotFoundError("Order item not found");
		}

		await this._orderRepository.deleteOrderItem(payload);
	}
	// End Order Item Service
}

export default OrderService;
