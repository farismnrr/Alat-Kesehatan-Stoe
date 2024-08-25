import type { RemoveKeys, RenameKeys } from "../../utils/model.types";
import type { IUser } from "./user.types";

type IOrder = {
	id: string;
	userId: string;
};

type IOrderMap = RenameKeys<IOrder, "id", "orderId">;
type IOrderUserMap = RenameKeys<IOrder, "userId", "user_id">;

export type { IOrder, IOrderMap, IOrderUserMap };
