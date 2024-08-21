import type { IProductRequest } from "../interface/product.interface";

const MapProduct = (product: IProductRequest) => {
	return {
		id: product.id,
		productName: product.product_name,
		description: product.description,
		price: parseFloat(product.price.toString()),
		stock: product.stock,
		categoryId: product.category_id
	};
};

export { MapProduct };
