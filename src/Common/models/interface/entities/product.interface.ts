import type { RenameKeys } from "../";

interface IProduct {
	id: string;
	categoryId: string;
	productName: string;
	description: string;
	price: number;
	stock: number;
}

interface IProductCache extends IProduct {
	source: string;
}

type IProductMap = RenameKeys<IProduct, "productName", "product_name"> &
	RenameKeys<IProduct, "categoryId", "category_id">;

export type { IProduct, IProductMap, IProductCache };
