import type { IProduct } from "../../../Common/models/types";
import { MapProduct } from "../../../Common/models/mapping";
import { Pool } from "pg";

interface IProductRepository {
	addProduct(product: Partial<IProduct>): Promise<string>;
	getProducts(product: Partial<IProduct>): Promise<IProduct[]>;
	getProductById(product: Partial<IProduct>): Promise<IProduct | null>;
	getProductsByCategoryId(product: Partial<IProduct>): Promise<IProduct[]>;
	editProductById(product: IProduct): Promise<void>;
	deleteProductById(product: Partial<IProduct>): Promise<void>;
}

class ProductRepository implements IProductRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addProduct(product: Partial<IProduct>): Promise<string> {
		const productQuery = {
			text: `
				INSERT INTO products (id, category_id, product_name, description, price, stock) 
				VALUES ($1, $2, $3, $4, $5, $6) 
				RETURNING id
			`,
			values: [
				product.id,
				product.categoryId,
				product.productName,
				product.description,
				product.price,
				product.stock
			]
		};

		const productResult = await this._pool.query(productQuery);
		return productResult.rows[0].id;
	}

	async getProducts(product: Partial<IProduct>): Promise<IProduct[]> {
		const conditions = [];
		const values = [];
		if (product.productName) {
			conditions.push(`product_name ILIKE $${conditions.length + 1}`);
			values.push(`%${product.productName}%`);
		}

		const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const productsQuery = {
			text: `SELECT id, category_id, product_name, description, price, stock FROM products ${whereClause}`,
			values: values
		};

		const productsResult = await this._pool.query(productsQuery);
		return productsResult.rows.map(product => MapProduct(product));
	}

	async getProductById(product: Partial<IProduct>): Promise<IProduct | null> {
		const productQuery = {
			text: `
				SELECT id, category_id, product_name, description, price, stock 
				FROM products 
				WHERE id = $1
			`,
			values: [product.id]
		};

		const productResult = await this._pool.query(productQuery);
		return productResult.rows[0] ? MapProduct(productResult.rows[0]) : null;
	}

	async getProductsByCategoryId(product: Partial<IProduct>): Promise<IProduct[]> {
		const productQuery = {
			text: `
				SELECT id, product_name, description, price, stock 
				FROM products 
				WHERE category_id = $1
		  	`,
			values: [product.id]
		};

		const productResult = await this._pool.query(productQuery);
		return productResult.rows.map(product => MapProduct(product));
	}

	async editProductById(product: IProduct): Promise<void> {
		let fields: string[] = [];
		let values: any[] = [];
		let index = 1;

		if (product.categoryId) {
			fields.push(`category_id = $${index++}`);
			values.push(product.categoryId);
		}
		if (product.productName) {
			fields.push(`product_name = $${index++}`);
			values.push(product.productName);
		}
		if (product.description) {
			fields.push(`description = $${index++}`);
			values.push(product.description);
		}
		if (product.price) {
			fields.push(`price = $${index++}`);
			values.push(product.price);
		}
		if (product.stock) {
			fields.push(`stock = $${index++}`);
			values.push(product.stock);
		}
		if (fields.length === 0) {
			throw new Error("Payload is empty");
		}

		const productQuery = {
			text: `UPDATE products SET ${fields.join(
				", "
			)}, updated_at = CURRENT_TIMESTAMP WHERE id = $${index}`,
			values: [...values, product.id]
		};

		await this._pool.query(productQuery);
	}

	async deleteProductById(product: Partial<IProduct>): Promise<void> {
		const productQuery = {
			text: `DELETE FROM products WHERE id = $1`,
			values: [product.id]
		};

		await this._pool.query(productQuery);
	}
}

export default ProductRepository;
