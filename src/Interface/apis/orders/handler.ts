import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IOrder } from "../../../Common/models/types";
import autoBind from "auto-bind";
import OrderService from "../../../App/services/order.service";
import OrderValidator from "../../../App/validators/orders";

class OrderHandler {
	private _orderService: OrderService;
	private _validator: typeof OrderValidator;

	constructor(orderService: OrderService, validator: typeof OrderValidator) {
		autoBind(this);
		this._orderService = orderService;
		this._validator = validator;
	}

	// Start Order Handler
	async postOrderHandler(request: Request, h: ResponseToolkit) {
		const user = request.auth.credentials as unknown as IOrder;
		const orderId = await this._orderService.addOrder({ userId: user.id });
		return h
			.response({
				status: "success",
				message: "Order successfully added",
				data: {
					orderId
				}
			})
			.code(201);
	}

	async getOrderByIdHandler(request: Request, h: ResponseToolkit) {
		const user = request.auth.credentials as unknown as IOrder;
		const orders = await this._orderService.getOrders({ userId: user.id });
		return h
			.response({
				status: "success",
				message: "Orders successfully retrieved",
				data: orders
			})
			.code(200);
	}

	async deleteOrderByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		const user = request.auth.credentials as unknown as IOrder;
		await this._orderService.deleteOrder({ id, userId: user.id });
		return h
			.response({
				status: "success",
				message: "Order successfully deleted"
			})
			.code(200);
	}
	// End Order Handler

	// Start Order Item Handler
	async postOrderItemHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as any;
		const user = request.auth.credentials as unknown as IOrder;
		const { id } = request.params;
		this._validator.validateAddOrderItemPayload(payload);
		const itemId = await this._orderService.addOrderItem(payload, id, user.id);
		return h
			.response({
				status: "success",
				message: "Order item successfully added",
				data: {
					itemId
				}
			})
			.code(201);
	}

	async getOrderItemsHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		const user = request.auth.credentials as unknown as IOrder;
		const orderItems = await this._orderService.getOrderItems({ orderId: id, userId: user.id });
		return h
			.response({
				status: "success",
				message: "Order items successfully retrieved",
				data: orderItems
			})
			.code(200);
	}

	async deleteOrderItemHandler(request: Request, h: ResponseToolkit) {
		const { id, itemId } = request.params;
		const user = request.auth.credentials as unknown as IOrder;
		await this._orderService.deleteOrderItem({ id: itemId, userId: user.id, orderId: id });
		return h
			.response({
				status: "success",
				message: "Order item successfully deleted"
			})
			.code(200);
	}
	// End Order Item Handler
}

export default OrderHandler;