import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../../error/NotFoundError";
import { InvariantError } from "../../error/InvariantError";

export class CategoryService {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addCategory({ name, description }: { name: string; description: string }) {
		const id = uuidv4();
		const categoryQuery = {
			text: "INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING id",
			values: [id, name, description]
		};

		const result = await this._pool.query(categoryQuery);
		if (!result.rowCount) {
			throw new InvariantError("Category already exists");
		}

		return result.rows[0].id;
	}

	async getCategories() {
		const categoriesQuery = {
			text: "SELECT id, name, description FROM categories"
		};

		const result = await this._pool.query(categoriesQuery);
		return result.rows;
	}

	async getCategoryById(id: string) {
		const categoryQuery = {
			text: "SELECT id, name, description FROM categories WHERE id = $1",
			values: [id]
		};

		const categoryResult = await this._pool.query(categoryQuery);
		if (!categoryResult.rowCount) {
			throw new NotFoundError("Category not found");
		}

		const category = categoryResult.rows[0];
		const productQuery = {
			text: "SELECT id, product_name, description, price, stock FROM products WHERE category_id = $1",
			values: [category.id]
		};

		const productResult = await this._pool.query(productQuery);
		return { ...category, products: productResult.rows };
	}

	async editCategoryById(
		id: string,
		{ name, description }: { name: string; description: string }
	) {
		const categoryQuery = {
			text: "UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING id",
			values: [name, description, id]
		};

		const result = await this._pool.query(categoryQuery);
		if (!result.rowCount) {
			throw new InvariantError("Failed to edit category");
		}
	}

	async deleteCategoryById(id: string) {
		const categoryQuery = {
			text: "DELETE FROM categories WHERE id = $1 RETURNING id",
			values: [id]
		};

		const result = await this._pool.query(categoryQuery);
		if (!result.rowCount) {
			throw new InvariantError("Failed to delete category");
		}
	}
}

export default CategoryService;
