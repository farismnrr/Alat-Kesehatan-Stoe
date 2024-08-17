import fs from "fs";
import path from "path";

import { Pool } from "pg";

class MigrationsService {
	private pool: Pool;

	constructor() {
		this.pool = new Pool();
	}

	async migrate() {
		try {
			await this.pool.query("BEGIN TRANSACTION");

			const migrations = [
				"create-admins-table.sql",
				"create-auth-table.sql",
				"create-categories-table.sql",
				"create-products-table.sql",
				"create-users-table.sql",
				"create-orders-table.sql",
				"create-orders-items-table.sql",
				"create-payments-table.sql"
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
