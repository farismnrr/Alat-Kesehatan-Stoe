interface IAuth {
	id: string;
	token: string;
	role: string;
}

interface IAuthToken extends IAuth {
	accessToken: string;
	refreshToken: string;
}

export type { IAuth, IAuthToken };
