import type { Request, ResponseToolkit } from "@hapi/hapi";
import type { ICategory } from "../../../Domain/models";
import autoBind from "auto-bind";
import CategoryService from "../../../Infrastructure/repositories/database/category.service";
import CategoryValidator from "../../../App/validator/categories";

interface CategoryHandler {
	postCategoryHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getCategoriesHandler(request: Request, h: ResponseToolkit): Promise<any>;
	getCategoryByIdHandler(request: Request, h: ResponseToolkit): Promise<any>;
	putCategoryHandler(request: Request, h: ResponseToolkit): Promise<any>;
	deleteCategoryHandler(request: Request, h: ResponseToolkit): Promise<any>;
}

class CategoryHandler implements CategoryHandler {
	private _categoryService: CategoryService;
	private _validator: typeof CategoryValidator;

	constructor(categoryService: CategoryService, validator: typeof CategoryValidator) {
		autoBind(this);
		this._categoryService = categoryService;
		this._validator = validator;
	}

	async postCategoryHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateCategoryPayload(request.payload);
		const { name, description } = request.payload as ICategory;
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

	async getCategoriesHandler(request: Request, h: ResponseToolkit) {
		const categories = await this._categoryService.getCategories();
		return h
			.response({
				status: "success",
				message: "Categories successfully fetched",
				data: categories
			})
			.code(200);
	}

	async getCategoryByIdHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		const category = await this._categoryService.getCategoryById({ id });
		return h
			.response({
				status: "success",
				message: "Category successfully fetched",
				data: category
			})
			.code(200);
	}

	async putCategoryHandler(request: Request, h: ResponseToolkit) {
		this._validator.validateCategoryPayload(request.payload);
		const { id } = request.params;
		const { name, description } = request.payload as ICategory;
		await this._categoryService.getCategoryById({ id });
		await this._categoryService.editCategoryById({ id, name, description });
		return h
			.response({
				status: "success",
				message: "Category successfully updated"
			})
			.code(200);
	}

	async deleteCategoryHandler(request: Request, h: ResponseToolkit) {
		const { id } = request.params;
		await this._categoryService.getCategoryById({ id });
		await this._categoryService.deleteCategoryById({ id });
		return h
			.response({
				status: "success",
				message: "Category successfully deleted"
			})
			.code(200);
	}
}

export default CategoryHandler;
