import type { IProductResponse } from "../../../Domain/models/interface";
import { Pool } from "pg";
import { MapProduct } from "../../../Domain/models/map";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, InvariantError } from "../../../Common/errors";

interface IProductRepository {
	addProduct(product: Partial<IProductResponse>): Promise<string>;
	getProducts(product: Partial<IProductResponse>): Promise<IProductResponse[]>;
	getProductById(product: Partial<IProductResponse>): Promise<IProductResponse>;
	editProductById(product: IProductResponse): Promise<void>;
	deleteProductById(product: Partial<IProductResponse>): Promise<void>;
}

class ProductRepository implements IProductRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addProduct(product: Partial<IProductResponse>) {
		const categoryQuery = {
			text: `SELECT id FROM categories WHERE id = $1`,
			values: [product.categoryId]
		};

		const categoryResult = await this._pool.query(categoryQuery);
		if (!categoryResult.rowCount) {
			throw new InvariantError("Category not found");
		}

		const id = uuidv4();
		const productQuery = {
			text: `
				INSERT INTO products (id, product_name, description, price, stock, category_id) 
				VALUES ($1, $2, $3, $4, $5, $6) 
				RETURNING id
			`,
			values: [
				id,
				product.productName,
				product.description,
				product.price,
				product.stock,
				product.categoryId
			]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new InvariantError("Failed to add product");
		}

		return productResult.rows[0].id;
	}

	async getProducts(product: Partial<IProductResponse>) {
		const conditions = [];
		const values = [];
		if (product.productName) {
			conditions.push(`product_name ILIKE $${conditions.length + 1}`);
			values.push(`%${product.productName}%`);
		}

		const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const productsQuery = {
			text: `SELECT id, product_name, description, price, stock, category_id FROM products ${whereClause}`,
			values: values
		};

		const productsResult = await this._pool.query(productsQuery);
		if (!productsResult.rowCount) {
			throw new NotFoundError("Failed to get products");
		}

		return productsResult.rows.map(MapProduct);
	}

	async getProductById(product: Partial<IProductResponse>) {
		const productQuery = {
			text: `
				SELECT id, product_name, description, price, stock, category_id 
				FROM products 
				WHERE id = $1
			`,
			values: [product.id]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new NotFoundError("Product not found");
		}

		return MapProduct(productResult.rows[0]);
	}

	async editProductById(product: IProductResponse) {
		const productQuery = {
			text: `
				UPDATE products 
				SET product_name = $1, description = $2, price = $3, stock = $4, category_id = $5, updated_at = CURRENT_TIMESTAMP 
				WHERE id = $6
			`,
			values: [
				product.productName,
				product.description,
				product.price,
				product.stock,
				product.categoryId,
				product.id
			]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new InvariantError("Failed to edit product");
		}
	}

	async deleteProductById(product: Partial<IProductResponse>) {
		const productQuery = {
			text: `DELETE FROM products WHERE id = $1`,
			values: [product.id]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new InvariantError("Failed to delete product");
		}
	}
}

export default ProductRepository;
