interface IProduct {
	id: string;
	description: string;
	price: number;
	stock: number;
}

interface IProductResponse extends IProduct {
	productName: string;
	categoryId: string;
}

interface IProductRequest extends IProduct {
	product_name: string;
	category_id: string;
}

export type { IProduct, IProductResponse, IProductRequest };

