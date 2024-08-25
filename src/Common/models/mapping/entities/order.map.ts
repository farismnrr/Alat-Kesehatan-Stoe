import type { IOrderMap, IOrderUserMap } from "../../types";

const MapOrder = (order: IOrderUserMap): IOrderMap => {
	return {
		orderId: order.id,
		userId: order.user_id
	};
};

export { MapOrder };
