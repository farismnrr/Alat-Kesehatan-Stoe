import autoBind from "auto-bind";

class ProductHandler {
	private _productService: any;
	private _validator: any;

	constructor(productService: any, validator: any) {
		autoBind(this);
		this._productService = productService;
		this._validator = validator;
	}

	async postProductHandler(request: any, h: any) {
		this._validator.validateProductPayload(request.payload);
		const { productName, description, price, stock, categoryId } = request.payload;
		const productId = await this._productService.addProduct({
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
}

export default ProductHandler;
