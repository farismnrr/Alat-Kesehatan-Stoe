import type { RenameKeys, RemoveKeys } from "../utils/model.types";
import type { IUser } from "./user.interface";

interface IOrder {
	id: string;
	userId: string;
	totalPrice: number;
}

type IOrderWithUser = RemoveKeys<IOrder, "userId"> & {
	user: IUser;
}

type IOrderMap = RenameKeys<IOrder, "userId", "user_id"> &
	RenameKeys<IOrder, "totalPrice", "total_price">;

export type { IOrder, IOrderMap, IOrderWithUser };


