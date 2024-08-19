import Hapi from "@hapi/hapi";
import users from "../../Interface/api/users";
import UserService from "../repositories/database/user.service";
import UserValidator from "../../App/validator/users";

import admins from "../../Interface/api/admins";
import AdminService from "../repositories/database/admin.service";
import AdminValidator from "../../App/validator/admins";

import products from "../../Interface/api/products";
import ProductService from "../repositories/database/product.service";
import ProductValidator from "../../App/validator/products";

import categories from "../../Interface/api/categories";
import CategoryService from "../repositories/database/category.service";
import CategoryValidator from "../../App/validator/categories";

import AuthService from "../repositories/database/auth.service";
import TokenManager from "../token/manager.token";
import CacheService from "../repositories/cache/cache.service";

const CustomPlugins = async (server: Hapi.Server) => {
	const userService = new UserService();
	const authService = new AuthService();
	const adminService = new AdminService();
	const tokenManager = new TokenManager();
	const cacheService = new CacheService();
	const productService = new ProductService();
	const categoryService = new CategoryService();
	await server.register([
		{
			plugin: users,
			options: {
				authService,
				userService,
				tokenManager,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				authService,
				adminService,
				tokenManager,
				validator: AdminValidator
			}
		},
		{
			plugin: products,
			options: {
				productService,
				validator: ProductValidator
			}
		},
		{
			plugin: categories,
			options: {
				categoryService,
				validator: CategoryValidator
			}
		}
	]);
};

export default CustomPlugins;
