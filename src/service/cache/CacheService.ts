import Redis from "ioredis";
import config from "../../utils/config";

class CacheService {
	private _client: Redis;

	constructor() {
		this._client = new Redis({
			host: config.redis.host,
			port: config.redis.port ? parseInt(config.redis.port) : undefined
		});

		this._client.on("error", err => {
			console.error(err);
		});

		this._client.connect();
	}

	async set(key: string, value: string, expirationInSeconds = 1800) {
		await this._client.set(key, value, 'EX', expirationInSeconds);
	}

	async get(key: string) {
		const result = await this._client.get(key);
		if (result == null) {
			throw new Error("Cache not found");
		}

		return result;
	}

	async delete(key: string) {
		await this._client.del(key);
	}
}

export default CacheService;
