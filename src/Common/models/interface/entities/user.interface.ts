interface IUser {
	id: string;
	username: string;
	password: string;
	email: string;
	birthdate: Date;
	gender: string;
	address: string;
	city: string;
	contactNumber: string;
}

interface IUserAuth extends IUser {
	accessToken: string;
	refreshToken: string;
}

export type { IUser, IUserAuth };
