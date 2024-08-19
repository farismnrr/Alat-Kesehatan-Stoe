import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

export class ProductService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addProduct({
		productName,
		description,
		price,
		stock,
		categoryId
	}: {
		productName: string;
		description: string;
		price: number;
		stock: number;
		categoryId: string;
	}) {
		const id = uuidv4();
		const productQuery = {
			text: "INSERT INTO products (id, product_name, description, price, stock, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
			values: [id, productName, description, price, stock, categoryId]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new Error("Failed to add product");
		}

		return productResult.rows[0].id;
	}

	async getProducts(productName: string) {
		const conditions = [];
		const values = [];
		if (productName) {
			conditions.push("product_name ILIKE $1");
			values.push(`%${productName}%`);
		}

		const productsQuery = {
			text: `SELECT id, product_name, description, price, stock FROM products WHERE ${conditions.join(
				" AND "
			)}`,
			values: values
		};

		const productsResult = await this._pool.query(productsQuery);
		if (!productsResult.rowCount) {
			throw new Error("Failed to get products");
		}

		const products = productsResult.rows;
		return products;
	}

	async getProductById(id: string) {
		const productQuery = {
			text: "SELECT id, product_name, description, price, stock, category_id FROM products WHERE id = $1 RETURNING *",
			values: [id]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new Error("Failed to get product");
		}

		return productResult.rows[0];
	}

	async editProductById(
		id: string,
		product: {
			productName: string;
			description: string;
			price: number;
			stock: number;
			categoryId: string;
		}
	) {
		const productQuery = {
			text: "UPDATE products SET product_name = $1, description = $2, price = $3, stock = $4, category_id = $5 WHERE id = $6",
			values: [
				product.productName,
				product.description,
				product.price,
				product.stock,
				product.categoryId,
				id
			]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new Error("Failed to edit product");
		}
	}

	async deleteProductById(id: string) {
		const productQuery = {
			text: "DELETE FROM products WHERE id = $1",
			values: [id]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new Error("Failed to delete product");
		}
	}
}

export default ProductService;
