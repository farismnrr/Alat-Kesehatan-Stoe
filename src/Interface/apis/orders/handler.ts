import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IOrder } from "../../../Common/models/interface";
import autoBind from "auto-bind";
// import OrderService from "../../../App/services/order.service";
import OrderRepository from "../../../Infrastructure/repositories/database/order.repository";
import OrderValidator from "../../../App/validators/orders";

class OrderHandler {
	// private _orderService: OrderService;
	private _orderRepository: OrderRepository;
	private _validator: typeof OrderValidator;

	constructor(orderRepository: OrderRepository, validator: typeof OrderValidator) {
		autoBind(this);
		// this._orderService = orderService;
		this._orderRepository = orderRepository;
		this._validator = validator;
	}

	async postOrderHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IOrder;
		const { id } = request.auth.credentials as unknown as IOrder;
		this._validator.validateAddOrderPayload(payload);
		const orderId = await this._orderRepository.addOrder({ ...payload, userId: id });
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
		const { id } = request.auth.credentials as unknown as IOrder;
		const orders = await this._orderRepository.getOrderByUserId({ userId: id });
		return h
			.response({
				status: "success",
				message: "Orders successfully retrieved",
				data: {
					...orders
				}
			})
			.code(200);
	}

	async deleteOrderByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		const user = request.auth.credentials as unknown as IOrder;
		await this._orderRepository.VerifyOrderAccess({ id, userId: user.id });
		await this._orderRepository.deleteOrderById({ id });
		return h
			.response({
				status: "success",
				message: "Order successfully deleted"
			})
			.code(200);
	}
}

export default OrderHandler;
