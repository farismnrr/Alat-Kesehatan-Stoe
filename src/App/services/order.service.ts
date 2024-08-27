import type {
	IOrder,
	IOrderUser,
	IOrderItem,
	IOrderCache,
	IOrderItemsCache
} from "../../Common/models/types";
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

	// Start Order Item Service
	addOrderItem(payload: IOrderItem, orderId: string, userId: string): Promise<string>;
	getOrderItems(payload: Partial<IOrderUser>): Promise<IOrderItemsCache>;
	deleteOrderItem(payload: Partial<IOrderItem>): Promise<void>;
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
		await this._cacheRepository.delete({ key: `order-item:${payload.userId}` });

		return orderId;
	}

	async getOrders(payload: Partial<IOrder>): Promise<IOrderCache> {
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
		await this._cacheRepository.delete({ key: `order-item:${payload.userId}` });
	}
	// End Order Service

	// Start Order Item Service
	async addOrderItem(payload: IOrderItem, orderId: string, userId: string): Promise<string> {
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

		await this._cacheRepository.delete({ key: `order-item:${userId}` });

		return orderItemId;
	}

	async getOrderItems(payload: Partial<IOrderUser>): Promise<IOrderItemsCache> {
		if (!payload.orderId || !payload.userId) {
			throw new InvariantError("Order ID and user ID are required");
		}

		const cacheKey = `order-item:${payload.userId}`;
		const cachedData = await this._cacheRepository.get({ key: cacheKey });
		const orderResult = cachedData ? JSON.parse(cachedData) : null;
		if (orderResult) {
			return {
				...orderResult,
				source: "cache"
			};
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

		const orderItems = await this._orderRepository.getOrderItemsByOrderId({
			orderId: payload.orderId
		});
		if (!orderItems) {
			throw new NotFoundError("Order items not found");
		}

		const orderItemsCache = {
			userId: payload.userId,
			orderId: payload.orderId,
			items: orderItems,
		};

		await this._cacheRepository.set({ key: cacheKey, value: JSON.stringify(orderItemsCache) });

		return {
			...orderItemsCache,
			source: "database"
		};
	}

	async deleteOrderItem(payload: Partial<IOrderItem>): Promise<void> {
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
		await this._cacheRepository.delete({ key: `order-item:${payload.userId}` });
	}
	// End Order Item Service
}

export default OrderService;
