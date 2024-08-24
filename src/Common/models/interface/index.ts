import type { IAuth } from "./entities/auth.interface";
import type { ICache } from "./entities/cache.interface";
import type { ICategory } from "./entities/category.interface";
import type { IUser, IUserAuth } from "./entities/user.interface";
import type { IAdmin, IAdminAuth } from "./entities/admin.interface";
import type { IProduct, IProductMap, IProductCache } from "./entities/product.interface";
import type { IOrder } from "./entities/order.interface";

export type {
	ICache,
	IProduct,
	IProductMap,
	IProductCache,
	ICategory,
	IUser,
	IUserAuth,
	IAuth,
	IAdmin,
	IAdminAuth,
	IOrder
};

type RenameKeys<T, U extends keyof T, V extends string> = {
	[P in keyof T as P extends U ? V : P]: T[P];
};

export type { RenameKeys };
