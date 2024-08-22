import fs from "fs";
import path from "path";
import { Pool } from "pg";

interface MigrationService {
	migrate(): Promise<void>;
}

class MigrationsService implements MigrationService {
	private pool: Pool;

	constructor() {
		this.pool = new Pool();
	}

	async migrate() {
		try {
			await this.pool.query("BEGIN TRANSACTION");

			const migrations = [
				"create-users-table.sql",
				"create-admins-table.sql",
				"create-auths-table.sql",
				"create-categories-table.sql",
				"create-products-table.sql",
				"create-orders-table.sql",
				"create-order-items-table.sql",
				"create-order-users-table.sql",
				"create-payments-table.sql",
				"create-user-ratings.sql"
			];

			for (const migration of migrations) {
				const filePath = path.resolve(__dirname, `../../../migrations/${migration}`);
				const fileContent = await fs.promises.readFile(filePath, "utf8");
				const queries = fileContent.split(";");

				for (const query of queries) {
					if (query.trim() !== "") {
						await this.pool.query(query);
					}
				}
			}

			await this.pool.query("COMMIT");
			console.log("All migrations executed successfully!");
		} catch (err) {
			await this.pool.query("ROLLBACK");
			console.error(err);
			console.log("Error executing migrations!");
		}
	}
}

export default MigrationsService;
