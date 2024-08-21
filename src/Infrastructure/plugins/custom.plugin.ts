import Hapi from "@hapi/hapi";
import users from "../../Interface/api/users";
import UserRepository from "../repositories/database/user.repository";
import UserValidator from "../../App/validator/users";

import admins from "../../Interface/api/admins";
import AdminRepository from "../repositories/database/admin.repository";
import AdminValidator from "../../App/validator/admins";

import products from "../../Interface/api/products";
import ProductRepository from "../repositories/database/product.repository";
import ProductValidator from "../../App/validator/products";

import categories from "../../Interface/api/categories";
import CategoryRepository from "../repositories/database/category.repository";
import CategoryValidator from "../../App/validator/categories";

import AuthRepository from "../repositories/database/auth.repository";
import TokenManager from "../token/manager.token";
import CacheRepository from "../repositories/cache/cache.repository";

const CustomPlugins = async (server: Hapi.Server) => {
	const userRepository = new UserRepository();
	const authRepository = new AuthRepository();
	const adminRepository = new AdminRepository();
	const tokenManager = new TokenManager();
	const cacheRepository = new CacheRepository();
	const productRepository = new ProductRepository();
	const categoryRepository = new CategoryRepository();
	await server.register([
		{
			plugin: users,
			options: {
				authRepository,
				userRepository,
				tokenManager,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				authRepository,
				adminRepository,
				tokenManager,
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
				categoryRepository,
				validator: CategoryValidator
			}
		}
	]);
};

export default CustomPlugins;
