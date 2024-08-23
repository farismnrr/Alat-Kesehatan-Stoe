import type { ICategory } from "../../../Common/models/interface";
import { Pool } from "pg";

interface ICategoryRepository {
	addCategory(category: ICategory): Promise<string>;
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

	async addCategory(category: ICategory): Promise<string> {
		const categoryQuery = {
			text: `
				INSERT INTO categories (name, description) 
				VALUES ($1, $2) 
				RETURNING id
		  	`,
			values: [category.name, category.description]
		};

		const categoryResult = await this._pool.query(categoryQuery);
		return categoryResult.rows[0].id;
	}

	async getCategories(): Promise<ICategory[]> {
		const categoriesQuery = {
			text: "SELECT id, name, description FROM categories"
		};

		const result = await this._pool.query(categoriesQuery);
		return result.rows;
	}

	async getCategoryById(category: Partial<ICategory>): Promise<ICategory[]> {
		const categoryQuery = {
			text: "SELECT id, name, description FROM categories WHERE id = $1",
			values: [category.id]
		};

		const categoryResult = await this._pool.query(categoryQuery);
		return categoryResult.rows[0];
	}

	async editCategoryById(category: ICategory): Promise<void> {
		let fields: string[] = [];
		let values: any[] = [];
		let index = 1;

		if (category.name) {
			fields.push(`name = $${index++}`);
			values.push(category.name);
		}

		if (category.description) {
			fields.push(`description = $${index++}`);
			values.push(category.description);
		}

		if (fields.length === 0) {
			throw new Error("Payload is empty");
		}

		const categoryQuery = {
			text: `UPDATE categories SET ${fields.join(
				", "
			)}, updated_at = CURRENT_TIMESTAMP WHERE id = $${index}`,
			values: [...values, category.id]
		};


		await this._pool.query(categoryQuery);
	}

	async deleteCategoryById(category: Partial<ICategory>): Promise<void> {
		const categoryQuery = {
			text: "DELETE FROM categories WHERE id = $1 RETURNING id",
			values: [category.id]
		};

		await this._pool.query(categoryQuery);
	}
}

export default CategoryRepository;
