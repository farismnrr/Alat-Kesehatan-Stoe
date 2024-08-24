interface IOrder {
	id: string;
	userId: string;
	quantity: number;
	totalPrice: number;
	status: string;
}

export type { IOrder };
