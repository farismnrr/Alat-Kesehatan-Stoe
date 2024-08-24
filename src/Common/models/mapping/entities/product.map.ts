import type { IProduct, IProductMap } from "../../interface/entities/product.interface";

const MapProduct = (product: IProductMap): IProduct => {
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
