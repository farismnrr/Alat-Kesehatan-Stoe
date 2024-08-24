import type { IProduct, IProductMap } from "../../types";

const MapProduct = (product: IProductMap): IProduct => {
	return {
		id: product.id,
		categoryId: product.category_id,
		productName: product.product_name,
		description: product.description,
		price: parseFloat(product.price.toString()),
		stock: product.stock
	};
};

export { MapProduct };
