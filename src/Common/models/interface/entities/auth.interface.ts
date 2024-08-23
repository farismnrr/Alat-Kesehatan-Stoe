interface IAuth {
	id: string;
	role: string;
	accessToken: string;
	refreshToken: string;
}

export type { IAuth };
