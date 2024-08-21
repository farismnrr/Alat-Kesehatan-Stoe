import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IProductResponse } from "../../../Domain/models/interface";
import autoBind from "auto-bind";
import ProductValidator from "../../../App/validator/products";
import ProductRepository from "../../../Infrastructure/repositories/database/product.repository";

interface ProductHandler {
	postProductHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getProductsHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
	updateProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
	deleteProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
}

class ProductHandler implements ProductHandler {
	private _productRepository: ProductRepository;
	private _validator: typeof ProductValidator;

	constructor(productRepository: ProductRepository, validator: typeof ProductValidator) {
		autoBind(this);
		this._productRepository = productRepository;
		this._validator = validator;
	}

	async postProductHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateProductPayload(request.payload);
		const { productName, description, price, stock, categoryId } =
			request.payload as IProductResponse;
		const productId = await this._productRepository.addProduct({
			productName,
			description,
			price,
			stock,
			categoryId
		});
		return h
			.response({
				status: "success",
				message: "Product successfully added",
				data: {
					productId
				}
			})
			.code(201);
	}

	async getProductsHandler(request: Request, h: ResponseToolkit) {
		const { productName } = request.query;
		const products = await this._productRepository.getProducts({ productName });
		return h
			.response({
				status: "success",
				message: "Products successfully fetched",
				data: {
					products
				}
			})
			.code(200);
	}

	async getProductByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		const product = await this._productRepository.getProductById({ id });
		return h
			.response({
				status: "success",
				message: "Product successfully fetched",
				data: {
					product
				}
			})
			.code(200);
	}

	async updateProductByIdHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateProductPayload(request.payload);
		const { id } = request.params;
		const { productName, description, price, stock, categoryId } =
			request.payload as IProductResponse;
		await this._productRepository.getProductById({ id });
		await this._productRepository.editProductById({
			id,
			productName,
			description,
			price,
			stock,
			categoryId
		});
		return h
			.response({
				status: "success",
				message: "Product successfully updated"
			})
			.code(200);
	}

	async deleteProductByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		await this._productRepository.getProductById({ id });
		await this._productRepository.deleteProductById({ id });
		return h
			.response({
				status: "success",
				message: "Product successfully deleted"
			})
			.code(200);
	}
}

export default ProductHandler;
