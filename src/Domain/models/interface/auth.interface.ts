interface IAuth {
	id: string;
	token: string;
	role: string;
}

interface ILoginRequest {
	email: string;
	username: string;
	password: string;
}

interface ILoginResponse {
	id: string;
	accessToken: string;
	refreshToken: string;
}

interface IRefreshToken {
	refreshToken: string;
}

export type { IAuth, ILoginRequest, ILoginResponse, IRefreshToken };
