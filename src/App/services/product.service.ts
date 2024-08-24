import type { IProduct, IProductMap, IProductCache } from "../../Common/models/interface";
import CacheRepository from "../../Infrastructure/repositories/cache/cache.repository";
import ProductRepository from "../../Infrastructure/repositories/database/product.repository";
import CategoryRepository from "../../Infrastructure/repositories/database/category.repository";
import { v4 as uuidv4 } from "uuid";
import { MapProduct } from "../../Common/models/mapping";
import { InvariantError, NotFoundError } from "../../Common/errors";

interface IProductService {
	addProduct(payload: IProduct): Promise<string>;
	getProducts(payload: Partial<IProduct>): Promise<IProduct[]>;
	getProductById(payload: Partial<IProduct>): Promise<IProductCache>;
	editProductById(param: Partial<IProduct>, payload: IProduct): Promise<void>;
	deleteProductById(param: Partial<IProduct>): Promise<void>;
}

class ProductService implements IProductService {
	private _productRepository: ProductRepository;
	private _categoryRepository: CategoryRepository;
	private _cacheRepository: CacheRepository;

	constructor(
		productRepository: ProductRepository,
		categoryRepository: CategoryRepository,
		cacheRepository: CacheRepository
	) {
		this._productRepository = productRepository;
		this._categoryRepository = categoryRepository;
		this._cacheRepository = cacheRepository;
	}

	async addProduct(payload: IProduct): Promise<string> {
		if (
			!payload.productName ||
			!payload.description ||
			!payload.price ||
			!payload.stock ||
			!payload.categoryId
		) {
			throw new InvariantError(
				"Name, description, price, stock, and categoryId are required"
			);
		}

		const id = uuidv4();
		const categoryId = await this._categoryRepository.getCategoryById({
			id: payload.categoryId
		});
		if (!categoryId) {
			throw new InvariantError("Category not found");
		}

		const productId = await this._productRepository.addProduct({ ...payload, id });
		if (!productId) {
			throw new InvariantError("Failed to add product");
		}

		await this._cacheRepository.delete({ key: `category:${payload.categoryId}` });
		await this._cacheRepository.delete({ key: `product:${id}` });

		return productId;
	}

	async getProducts(payload: Partial<IProduct>): Promise<IProduct[]> {
		const products = await this._productRepository.getProducts(payload);
		return products.map((product: IProduct) => MapProduct(product as IProductMap));
	}

	async getProductById(payload: Partial<IProduct>): Promise<IProductCache> {
		if (!payload.id) {
			throw new InvariantError("Please provide a valid product ID");
		}

		const cacheKey = `product:${payload.id}`;
		const cachedData = await this._cacheRepository.get({ key: cacheKey });
		const productResult = cachedData ? JSON.parse(cachedData) : null;
		if (productResult) {
			return {
				...productResult,
				source: "cache"
			};
		}

		const product = await this._productRepository.getProductById(payload);
		if (!product) {
			throw new NotFoundError("Product not found");
		}

		const dbData = MapProduct(product as IProductMap);
		await this._cacheRepository.set({ key: cacheKey, value: JSON.stringify(dbData) });

		return {
			...dbData,
			source: "database"
		};
	}

	async editProductById(param: Partial<IProduct>, payload: IProduct): Promise<void> {
		if (!param.id) {
			throw new InvariantError("Please provide a valid product ID");
		}

		const product = await this._productRepository.getProductById(param);
		if (!product) {
			throw new NotFoundError("Product not found");
		}

		await this._productRepository.editProductById({ ...param, ...payload });
		await this._cacheRepository.delete({ key: `product:${param.id}` });
	}

	async deleteProductById(param: Partial<IProduct>): Promise<void> {
		if (!param.id) {
			throw new InvariantError("Please provide a valid product ID");
		}

		const product = await this._productRepository.getProductById(param);
		if (!product) {
			throw new NotFoundError("Product not found");
		}

		await this._productRepository.deleteProductById(param);
		await this._cacheRepository.delete({ key: `product:${param.id}` });
	}
}

export default ProductService;
