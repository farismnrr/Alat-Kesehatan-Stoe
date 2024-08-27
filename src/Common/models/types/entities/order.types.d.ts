import type { RemoveKeys, RenameKeys } from "../../utils/model.types";
import type { IUser } from "./user.types";

type IOrder = {
	id: string;
	userId: string;
};

type IOrderUser = {
	userId: string;
	orderId: string;
};

interface IOrderCache {
	orders: IOrderUser[];
	source: string;
}

type IOrderItem = {
	id: string;
	userId: string;
	orderId: string;
	productId: string;
	quantity: number;
};

type IOrderItemGet = RemoveKeys<IOrderItem, "orderId" | "userId">;
interface IOrderItems extends IOrderItemGet {
	subtotal: number;
}

interface IOrderItemsCache extends IOrderUser {
	items: IOrderItems[];
	source: string;
}

type IOrderMap = RenameKeys<IOrder, "id", "orderId">;
type IOrderUserMap = RenameKeys<IOrder, "userId", "user_id">;
type IOrderItemsMap = RenameKeys<IOrderItems, "orderId", "order_id" & "productId", "product_id">;

export type {
	IOrder,
	IOrderUser,
	IOrderMap,
	IOrderUserMap,
	IOrderItem,
	IOrderItems,
	IOrderItemsMap,
	IOrderCache,
	IOrderItemsCache
};
