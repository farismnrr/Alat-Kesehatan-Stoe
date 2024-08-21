import type { ICategory } from "../../../Domain/models/interface";
import { Pool } from "pg";
import { MapProduct } from "../../../Domain/models/map";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, InvariantError } from "../../../Common/errors";

interface ICategoryRepository {
	addCategory(category: Partial<ICategory>): Promise<string>;
	getCategories(): Promise<ICategory[]>;
	getCategoryById(category: Partial<ICategory>): Promise<any>;
	editCategoryById(category: ICategory): Promise<void>;
	deleteCategoryById(category: Partial<ICategory>): Promise<void>;
}

class CategoryRepository implements ICategoryRepository {
	private _pool: Pool;

	constructor() {
		this._pool = new Pool();
	}

	async addCategory(category: Partial<ICategory>) {
		const id = uuidv4();
		const categoryQuery = {
			text: "INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING id",
			values: [id, category.name, category.description]
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

	async getCategoryById(category: Partial<ICategory>) {
		const categoryQuery = {
			text: "SELECT id, name, description FROM categories WHERE id = $1",
			values: [category.id]
		};

		const categoryResult = await this._pool.query(categoryQuery);
		if (!categoryResult.rowCount) {
			throw new NotFoundError("Category not found");
		}

		const categoryData = categoryResult.rows[0];
		const productQuery = {
			text: "SELECT id, product_name, description, price, stock FROM products WHERE category_id = $1",
			values: [categoryData.id]
		};

		const productResult = await this._pool.query(productQuery);
		return {
			...categoryData,
			products: productResult.rows.map(MapProduct)
		};
	}

	async editCategoryById(category: ICategory) {
		const categoryQuery = {
			text: "UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING id",
			values: [category.name, category.description, category.id]
		};

		const result = await this._pool.query(categoryQuery);
		if (!result.rowCount) {
			throw new InvariantError("Failed to edit category");
		}
	}

	async deleteCategoryById(category: Partial<ICategory>) {
		const categoryQuery = {
			text: "DELETE FROM categories WHERE id = $1 RETURNING id",
			values: [category.id]
		};

		const result = await this._pool.query(categoryQuery);
		if (!result.rowCount) {
			throw new InvariantError("Failed to delete category");
		}
	}
}

export default CategoryRepository;
