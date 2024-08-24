interface IAdmin {
	id: string;
	username: string;
	password: string;
	email: string;
}

interface IAdminAuth extends IAdmin {
	accessToken: string;
	refreshToken: string;
}

export type { IAdmin, IAdminAuth };
