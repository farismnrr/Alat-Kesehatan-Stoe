import type { ICache } from "../../../Common/models/interface";
import Redis from "ioredis";
import Config from "../../settings/config";

interface ICacheRepository {
	set(cache: ICache): Promise<void>;
	get(cache: Partial<ICache>): Promise<string>;
	delete(cache: Partial<ICache>): Promise<void>;
}

class CacheRepository {
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

	async set(cache: ICache, expirationInSeconds = 1800): Promise<void> {
		await this._client.set(cache.key, cache.value, "EX", expirationInSeconds);
	}

	async get(cache: Partial<ICache>): Promise<string | null> {
		if (!cache.key) {
			return null;
		}
		const result = await this._client.get(cache.key);
		return result;
	}

	async delete(cache: Partial<ICache>): Promise<void> {
		if (!cache.key) {
			return;
		}
		await this._client.del(cache.key);
	}
}

export default CacheRepository;
