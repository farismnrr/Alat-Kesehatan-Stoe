const config = {
	server: {
		host: process.env.HOST || "0.0.0.0",
		port: process.env.PORT || 8080
	},
	jwt: {
		accessTokenKey: process.env.ACCESS_TOKEN_KEY,
		refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
		accessTokenAge: process.env.ACCESS_TOKEN_AGE
	}
};

export default config;
