import Hapi from "@hapi/hapi";

import users from "../../Interface/apis/users";
import UserRepository from "../repositories/database/user.repository";
import UserValidator from "../../App/validators/users";
import UserService from "../../App/services/user.service";

import admins from "../../Interface/apis/admins";
import AdminRepository from "../repositories/database/admin.repository";
import AdminService from "../../App/services/admin.service";
import AdminValidator from "../../App/validators/admins";

import products from "../../Interface/apis/products";
import ProductRepository from "../repositories/database/product.repository";
import ProductService from "../../App/services/product.service";
import ProductValidator from "../../App/validators/products";

import categories from "../../Interface/apis/categories";
import CategoryRepository from "../repositories/database/category.repository";
import CategoryService from "../../App/services/category.service";
import CategoryValidator from "../../App/validators/categories";

import orders from "../../Interface/apis/orders";
import OrderRepository from "../repositories/database/order.repository";
import OrderService from "../../App/services/order.service";
import OrderValidator from "../../App/validators/orders";

import TokenManager from "../../Common/tokens/manager.token";
import AuthRepository from "../repositories/database/auth.repository";
import CacheRepository from "../repositories/cache/cache.repository";

const CustomPlugins = async (server: Hapi.Server) => {
	const userRepository = new UserRepository();
	const authRepository = new AuthRepository();
	const adminRepository = new AdminRepository();
	const cacheRepository = new CacheRepository();
	const orderRepository = new OrderRepository();
	const productRepository = new ProductRepository();
	const categoryRepository = new CategoryRepository();

	const userService = new UserService(authRepository, userRepository);
	const adminService = new AdminService(authRepository, adminRepository);
	const orderService = new OrderService(authRepository, orderRepository);
	const productService = new ProductService(
		productRepository,
		categoryRepository,
		cacheRepository
	);
	const categoryService = new CategoryService(
		categoryRepository,
		productRepository,
		cacheRepository
	);
	await server.register([
		{
			plugin: users,
			options: {
				service: userService,
				token: TokenManager,
				validator: UserValidator
			}
		},
		{
			plugin: admins,
			options: {
				service: adminService,
				token: TokenManager,
				validator: AdminValidator
			}
		},
		{
			plugin: products,
			options: {
				service: productService,
				validator: ProductValidator
			}
		},
		{
			plugin: categories,
			options: {
				service: categoryService,
				validator: CategoryValidator
			}
		},
		{
			plugin: orders,
			options: {
				service: orderService,
				validator: OrderValidator
			}
		}
	]);
};

export default CustomPlugins;
