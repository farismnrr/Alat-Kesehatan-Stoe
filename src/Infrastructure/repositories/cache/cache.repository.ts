import type { ICache } from "../../../Domain/models/interface";
import Redis from "ioredis";
import Config from "../../../utils/config";

interface ICacheRepository {
	set(cache: ICache): Promise<void>;
	get(cache: Partial<ICache>): Promise<string>;
	delete(cache: Partial<ICache>): Promise<void>;
}

class CacheRepository implements ICacheRepository {
	private _client: Redis;

	constructor() {
		this._client = new Redis({
			host: Config.redis.host,
			port: Config.redis.port ? parseInt(Config.redis.port) : undefined
		});

		this._client.on("error", err => {
			console.error(err);
		});

		this._client.on("connect", () => {
			console.log("Connected to Redis");
		});
	}

	async set(cache: ICache) {
		await this._client.set(cache.key, cache.value, "EX", cache.expirationInSeconds);
	}

	async get(cache: Partial<ICache>) {
		if (!cache.key) {
			throw new Error("Key is required");
		}
		const result = await this._client.get(cache.key);
		if (result == null) {
			throw new Error("Cache not found");
		}

		return result;
	}

	async delete(cache: Partial<ICache>) {
		if (!cache.key) {
			throw new Error("Key is required");
		}
		await this._client.del(cache.key);
	}
}

export default CacheRepository;
