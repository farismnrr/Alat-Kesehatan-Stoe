interface IAuth {
	id: string;
	token: string;
}

interface ILogin {
	username: string;
	password: string;
}

interface IRefreshToken {
	refreshToken: string;
}

export type { IAuth, ILogin, IRefreshToken };
