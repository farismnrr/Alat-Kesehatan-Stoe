import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IOrder } from "../../../Common/models/interface";
import autoBind from "auto-bind";
import OrderService from "../../../App/services/order.service";
import OrderValidator from "../../../App/validators/orders";

class OrderHandler {
	private _orderService: OrderService;
	private _validator: typeof OrderValidator;

	constructor(
		orderService: OrderService,
		validator: typeof OrderValidator
	) {
		autoBind(this);
		this._orderService = orderService;
		this._validator = validator;
	}

	async postOrderHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IOrder;
		const user = request.auth.credentials as unknown as IOrder;
		this._validator.validateAddOrderPayload(payload);
		const orderId = await this._orderService.addOrder({ ...payload, userId: user.id });
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
}

export default OrderHandler;
