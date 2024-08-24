import type { IOrder, IOrderMap, IUserMap, IOrderWithUser } from "../../interface";
import { MapUser } from "./user.map";

const MapOrder = (order: IOrderMap): IOrder => {
	return {
		id: order.id,
		userId: order.user_id,
		totalPrice: order.total_price
	};
};

const MapOrderWithUser = (order: IOrderMap, user: IUserMap): IOrderWithUser => {
	return {
		id: order.id,
		totalPrice: parseFloat(order.total_price.toString()),
		user: MapUser(user)
	};
};

export { MapOrder, MapOrderWithUser };
