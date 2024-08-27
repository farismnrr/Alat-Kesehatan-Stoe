import type { IOrderMap, IOrderUserMap, IOrderItemsMap, IOrderItems } from "../../types";

const MapOrder = (order: IOrderUserMap): IOrderMap => {
	return {
		orderId: order.id,
		userId: order.user_id
	};
};

const MapOrderItem = (orderItem: IOrderItemsMap): IOrderItems => {
	return {
		id: orderItem.id,
		productId: orderItem.product_id,
		quantity: orderItem.quantity,
		subtotal: parseFloat(orderItem.subtotal.toString())
	};
};

export { MapOrder, MapOrderItem };
