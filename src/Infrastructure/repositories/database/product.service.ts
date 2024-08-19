import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, InvariantError } from "../../../Common/errors";

interface IProduct {
	id: string;
	productName: string;
	description: string;
	price: number;
	stock: number;
	categoryId: string;
}

interface IProductService {
	addProduct(product: IProduct): Promise<string>;
	getProducts(product: Partial<IProduct>): Promise<IProduct[]>;
	getProductById(product: Partial<IProduct>): Promise<IProduct>;
	editProductById(product: IProduct): Promise<void>;
	deleteProductById(product: Partial<IProduct>): Promise<void>;
}

export class ProductService implements IProductService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addProduct(product: Partial<IProduct>) {
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

	async getProducts(product: Partial<IProduct>) {
		const conditions = [];
		const values = [];
		if (product.productName) {
			conditions.push("product_name ILIKE $1");
			values.push(`%${product.productName}%`);
		}

		const productsQuery = {
			text: `SELECT id, product_name, description, price, stock FROM products WHERE ${conditions.join(
				" AND "
			)}`,
			values: values
		};

		const productsResult = await this._pool.query(productsQuery);
		if (!productsResult.rowCount) {
			throw new NotFoundError("Failed to get products");
		}

		const products = productsResult.rows;
		return products;
	}

	async getProductById(product: Partial<IProduct>) {
		const productQuery = {
			text: `
				SELECT id, product_name, description, price, stock, category_id 
				FROM products 
				WHERE id = $1 
				RETURNING *
			`,
			values: [product.id]
		};

		const productResult = await this._pool.query(productQuery);
		if (!productResult.rowCount) {
			throw new NotFoundError("Failed to get product");
		}

		return productResult.rows[0];
	}

	async editProductById(product: IProduct) {
		const productQuery = {
			text: `
				UPDATE products 
				SET product_name = $1, description = $2, price = $3, stock = $4, category_id = $5 
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

	async deleteProductById(product: Partial<IProduct>) {
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

export default ProductService;
