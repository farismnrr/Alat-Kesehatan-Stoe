import type { IProduct } from "../../Common/models/interface";
import ProductRepository from "../../Infrastructure/repositories/database/product.repository";
import CategoryRepository from "../../Infrastructure/repositories/database/category.repository";
import { v4 as uuidv4 } from "uuid";
import { MapProduct } from "../../Common/models/mapping";
import { InvariantError, NotFoundError } from "../../Common/errors";

interface IProductService {
	addProduct(payload: IProduct): Promise<string>;
	getProducts(payload: Partial<IProduct>): Promise<IProduct[]>;
	getProductById(payload: Partial<IProduct>): Promise<IProduct>;
	editProductById(param: Partial<IProduct>, payload: IProduct): Promise<void>;
	deleteProductById(param: Partial<IProduct>): Promise<void>;
}

class ProductService implements IProductService {
	private _productRepository: ProductRepository;
	private _categoryRepository: CategoryRepository;

	constructor(productRepository: ProductRepository, categoryRepository: CategoryRepository) {
		this._productRepository = productRepository;
		this._categoryRepository = categoryRepository;
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

		return productId;
	}

	async getProducts(payload: Partial<IProduct>): Promise<IProduct[]> {
		const products = await this._productRepository.getProducts(payload);
		return products.map(MapProduct);
	}

	async getProductById(payload: Partial<IProduct>): Promise<IProduct> {
		if (!payload.id) {
			throw new InvariantError("Please provide a valid product ID");
		}

		const product = await this._productRepository.getProductById(payload);
		if (!product) {
			throw new NotFoundError("Product not found");
		}

		return MapProduct(product);
	}

	async editProductById(param: Partial<IProduct>, payload: IProduct): Promise<void> {
		if (!param.id) {
			throw new InvariantError("Please provide a valid product ID");
		}

		const product = await this._productRepository.getProductById(param);
		if (!product) {
			throw new NotFoundError("Product not found");
		}

		await this._productRepository.editProductById(payload);
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
	}
}

export default ProductService;
