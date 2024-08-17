import * as fs from "fs";
import * as crypto from "crypto";

const generateHmacKey = (): string => {
	const secretKey = crypto.randomBytes(64);
	const hmac = crypto.createHmac("sha512", secretKey);
	hmac.update(crypto.randomBytes(2048));
	return hmac.digest("hex");
};

const updateEnvFile = (accessTokenKey: string, refreshTokenKey: string): void => {
	const envFilePath = ".env";
	const envFileContent = fs.readFileSync(envFilePath, "utf-8");
	const updatedEnvFileContent = envFileContent
		.replace(/ACCESS_TOKEN_KEY=.*/, `ACCESS_TOKEN_KEY=${accessTokenKey}`)
		.replace(/REFRESH_TOKEN_KEY=.*/, `REFRESH_TOKEN_KEY=${refreshTokenKey}`);
	fs.writeFileSync(envFilePath, updatedEnvFileContent);
};

const TokenGenerator = (): void => {
	const accessTokenKey = generateHmacKey();
	const refreshTokenKey = generateHmacKey();
	updateEnvFile(accessTokenKey, refreshTokenKey);
};

TokenGenerator();
