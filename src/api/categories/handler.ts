import autoBind from "auto-bind";

class CategoryHandler {
	private _categoryService: any;
	private _validator: any;

	constructor(categoryService: any, validator: any) {
		autoBind(this);
		this._categoryService = categoryService;
		this._validator = validator;
	}

	async postCategoryHandler(request: any, h: any) {
		this._validator.validateCategoryPayload(request.payload);
		const { name, description } = request.payload;
		const categoryId = await this._categoryService.addCategory({ name, description });
		return h
			.response({
				status: "success",
				message: "Category successfully added",
				data: {
					categoryId
				}
			})
			.code(201);
	}

	async getCategoriesHandler(request: any, h: any) {
		const categories = await this._categoryService.getCategories();
		return h
			.response({
				status: "success",
				message: "Categories successfully fetched",
				data: categories
			})
			.code(200);
	}

	async getCategoryByIdHandler(request: any, h: any) {
		const { id } = request.params;
		const category = await this._categoryService.getCategoryById(id);
		return h
			.response({
				status: "success",
				message: "Category successfully fetched",
				data: category
			})
			.code(200);
	}

	async putCategoryHandler(request: any, h: any) {
		this._validator.validateCategoryPayload(request.payload);
		const { id } = request.params;
		const { name, description } = request.payload;
		await this._categoryService.getCategoryById(id);
		await this._categoryService.editCategoryById(id, { name, description });
		return h
			.response({
				status: "success",
				message: "Category successfully updated"
			})
			.code(200);
	}

	async deleteCategoryHandler(request: any, h: any) {
		const { id } = request.params;
		await this._categoryService.getCategoryById(id);
		await this._categoryService.deleteCategoryById(id);
		return h
			.response({
				status: "success",
				message: "Category successfully deleted"
			})
			.code(200);
	}
}

export default CategoryHandler;
