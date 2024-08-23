import type { ICategory } from "../../Common/models/interface";
import { MapProduct } from "../../Common/models/mapping";
import ProductRepository from "../../Infrastructure/repositories/database/product.repository";
import CategoryRepository from "../../Infrastructure/repositories/database/category.repository";
import { v4 as uuidv4 } from "uuid";
import { InvariantError, NotFoundError } from "../../Common/errors";

interface ICategoryService {
	addCategory(payload: ICategory): Promise<string>;
	getCategories(): Promise<ICategory[]>;
	getCategory(payload: Partial<ICategory>): Promise<any>;
	editCategory(param: Partial<ICategory>, payload: ICategory): Promise<void>;
	deleteCategory(param: Partial<ICategory>): Promise<void>;
}

class CategoryService implements ICategoryService {
	private _categoryRepository: CategoryRepository;
	private _productRepository: ProductRepository;

	constructor(_categoryRepository: CategoryRepository, _productRepository: ProductRepository) {
		this._categoryRepository = _categoryRepository;
		this._productRepository = _productRepository;
	}
	async addCategory(payload: ICategory): Promise<string> {
		if (!payload.name || !payload.description) {
			throw new InvariantError("Name and description are required");
		}

		const id = uuidv4();
		const categoryId = await this._categoryRepository.addCategory({ ...payload, id });
		if (!categoryId) {
			throw new InvariantError("Failed to add category");
		}

		return categoryId;
	}

	async getCategories(): Promise<ICategory[]> {
		const categories = await this._categoryRepository.getCategories();
		if (!categories.length) {
			throw new NotFoundError("No categories found");
		}

		return categories;
	}

	async getCategory(payload: Partial<ICategory>): Promise<any> {
		if (!payload) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const categoryData = await this._categoryRepository.getCategoryById(payload);
		if (!categoryData) {
			throw new NotFoundError("Category not found");
		}

		const products = await this._productRepository.getProductsByCategoryId(payload);
		if (!products.length) {
			throw new NotFoundError("No products found");
		}

		return {
			...categoryData,
			products: products.map(MapProduct)
		};
	}

	async editCategory(param: Partial<ICategory>, payload: ICategory): Promise<void> {
		if (!param) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const category = await this._categoryRepository.getCategoryById(param);
		if (!category) {
			throw new NotFoundError("Category not found");
		}

		await this._categoryRepository.editCategoryById({ ...param, ...payload });
	}

	async deleteCategory(param: Partial<ICategory>): Promise<void> {
		if (!param) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const category = await this._categoryRepository.getCategoryById(param);
		if (!category) {
			throw new NotFoundError("Category not found");
		}

		await this._categoryRepository.deleteCategoryById(param);
	}
}

export default CategoryService;
