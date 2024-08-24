import type { IProduct } from "./product.types";

interface ICategory {
	id: string;
	name: string;
	description: string;
}

interface ICategoryWithProducts extends ICategory {
	products: IProduct[];
	source: string;
}

export type { ICategory, ICategoryWithProducts };
