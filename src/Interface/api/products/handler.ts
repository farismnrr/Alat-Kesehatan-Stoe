import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { IProduct } from "../../../Common/models/interface";
import autoBind from "auto-bind";
import ProductValidator from "../../../App/validator/products";
import ProductService from "../../../App/service/product.service";

interface ProductHandler {
	postProductHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getProductsHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
	updateProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
	deleteProductByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
}

class ProductHandler implements ProductHandler {
	private _productService: ProductService;
	private _validator: typeof ProductValidator;

	constructor(
		productService: ProductService,
		validator: typeof ProductValidator
	) {
		autoBind(this);
		this._productService = productService;
		this._validator = validator;
	}

	async postProductHandler(request: Request, h: ResponseToolkit) {
		const payload = request.payload as IProduct;
		this._validator.validateAddProductPayload(payload);
		const productId = await this._productService.addProduct(payload);
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
		const products = await this._productService.getProducts({ productName });
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
		const product = await this._productService.getProductById({ id });
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
		const payload = request.payload as IProduct;
		const { id } = request.params;
		this._validator.validateUpdateProductPayload(payload);
		await this._productService.editProductById({ id }, payload);
		return h
			.response({
				status: "success",
				message: "Product successfully updated"
			})
			.code(200);
	}

	async deleteProductByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		await this._productService.deleteProductById({ id });
		return h
			.response({
				status: "success",
				message: "Product successfully deleted"
			})
			.code(200);
	}
}

export default ProductHandler;
