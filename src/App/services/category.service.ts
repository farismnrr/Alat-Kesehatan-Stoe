import type { ICategory } from "../../Common/models/interface";
import { MapProduct } from "../../Common/models/mapping";
import CacheRepository from "../../Infrastructure/repositories/cache/cache.repository";
import ProductRepository from "../../Infrastructure/repositories/database/product.repository";
import CategoryRepository from "../../Infrastructure/repositories/database/category.repository";
import { v4 as uuidv4 } from "uuid";
import { InvariantError, NotFoundError } from "../../Common/errors";

interface ICategoryService {
	addCategory(payload: ICategory): Promise<string>;
	getCategories(): Promise<ICategory[]>;
	getCategory(payload: Partial<ICategory>): Promise<any>;
	editCategoryById(param: Partial<ICategory>, payload: ICategory): Promise<void>;
	deleteCategoryById(param: Partial<ICategory>): Promise<void>;
}

class CategoryService implements ICategoryService {
	private _categoryRepository: CategoryRepository;
	private _productRepository: ProductRepository;
	private _cacheRepository: CacheRepository;

	constructor(
		categoryRepository: CategoryRepository,
		productRepository: ProductRepository,
		cacheRepository: CacheRepository
	) {
		this._categoryRepository = categoryRepository;
		this._productRepository = productRepository;
		this._cacheRepository = cacheRepository;
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

		await this._cacheRepository.delete({ key: `category:${categoryId}` });

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
		if (!payload.id) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const cacheKey = `category:${payload.id}`;
		const cachedData = await this._cacheRepository.get({ key: cacheKey });
		const categoryResult = cachedData ? JSON.parse(cachedData) : null;
		if (categoryResult) {
			return {
				...categoryResult,
				source: "cache"
			};
		}

		const categoryData = await this._categoryRepository.getCategoryById(payload);
		if (!categoryData) {
			throw new NotFoundError("Category not found");
		}

		const products = await this._productRepository.getProductsByCategoryId(payload);
		if (!products) {
			throw new NotFoundError("No products found");
		}

		const dbData = { ...categoryData, products: products.map(MapProduct) };
		await this._cacheRepository.set({
			key: cacheKey,
			value: JSON.stringify(dbData)
		});

		return {
			...dbData,
			source: "database"
		};
	}

	async editCategoryById(param: Partial<ICategory>, payload: ICategory): Promise<void> {
		if (!param.id) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const category = await this._categoryRepository.getCategoryById(param);
		if (!category) {
			throw new NotFoundError("Category not found");
		}

		await this._categoryRepository.editCategoryById({ ...param, ...payload });
		await this._cacheRepository.delete({ key: `category:${param.id}` });
	}

	async deleteCategoryById(param: Partial<ICategory>): Promise<void> {
		if (!param.id) {
			throw new InvariantError("Please provide a valid category ID");
		}

		const category = await this._categoryRepository.getCategoryById(param);
		if (!category) {
			throw new NotFoundError("Category not found");
		}

		await this._categoryRepository.deleteCategoryById(param);
		await this._cacheRepository.delete({ key: `category:${param.id}` });
	}
}

export default CategoryService;
