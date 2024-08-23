interface IOrder {
	id: string;
	userId: string;
	quantity: number;
	totalPrice: number;
	status: string;
}

interface IOrderAuth extends IOrder {
	accessToken: string;
	refreshToken: string;
}

interface IOrderItems {
	id: string;
	orderId: string;
	productId: string;
	quantity: number;
	subtotal: number;
}

interface IOrderItemsAuth extends IOrderItems {
	accessToken: string;
	refreshToken: string;
}

export type { IOrder, IOrderAuth, IOrderItems, IOrderItemsAuth };
