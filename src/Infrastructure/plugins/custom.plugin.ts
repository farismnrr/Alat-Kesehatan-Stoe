import Hapi from "@hapi/hapi";

import users from "../../Interface/api/users";
import UserRepository from "../repositories/database/user.repository";
import UserValidator from "../../App/validator/users";
import UserService from "../../App/service/user.service";

import admins from "../../Interface/api/admins";
import AdminRepository from "../repositories/database/admin.repository";
import AdminValidator from "../../App/validator/admins";
import AdminService from "../../App/service/admin.service";

import products from "../../Interface/api/products";
import ProductRepository from "../repositories/database/product.repository";
import ProductValidator from "../../App/validator/products";

import categories from "../../Interface/api/categories";
import CategoryRepository from "../repositories/database/category.repository";
import CategoryValidator from "../../App/validator/categories";
import CategoryService from "../../App/service/category.service";

import AuthRepository from "../repositories/database/auth.repository";
import TokenManager from "../token/manager.token";
import CacheRepository from "../repositories/cache/cache.repository";

const CustomPlugins = async (server: Hapi.Server) => {
	const tokenManager = new TokenManager();
	const userRepository = new UserRepository();
	const authRepository = new AuthRepository();
	const adminRepository = new AdminRepository();
	const cacheRepository = new CacheRepository();
	const productRepository = new ProductRepository();
	const categoryRepository = new CategoryRepository();
	const userService = new UserService(authRepository, userRepository);
	const adminService = new AdminService(authRepository, adminRepository);
	const categoryService = new CategoryService(categoryRepository, productRepository);

	await server.register([
		{
			plugin: users,
			options: {
				token: tokenManager,
				service: userService,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				token: tokenManager,
				service: adminService,
				validator: AdminValidator
			}
		},
		{
			plugin: products,
			options: {
				productRepository,
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
