import { Pool } from "pg";
import { InvariantError } from "../../error/InvariantError";

class AuthService {
    private _pool: Pool;
    
	constructor() {
        this._pool = new Pool();
    }

    async addRefreshToken(token: string) {
        const authQuery = {
            text: 'INSERT INTO auth VALUES($1)',
            values: [token]
        }

        const authResult = await this._pool.query(authQuery);
        if (!authResult.rowCount) {
            throw new InvariantError('Failed to add refresh token');
        }
    }

    async verifyRefreshToken(token: string) {
        const authQuery = {
            text: 'SELECT token FROM auth WHERE token = $1',
            values: [token]
        }

        const authResult = await this._pool.query(authQuery);
        if (!authResult.rowCount) {
            throw new InvariantError('Refresh token is not valid');
        }
    }

    async deleteRefreshToken(token: string) {
        const authQuery = {
            text: 'DELETE FROM auth WHERE token = $1',
            values: [token]
        }

        const authResult = await this._pool.query(authQuery);
        if (!authResult.rowCount) {
            throw new InvariantError('Refresh token is not valid');
        }
    }
}

export default AuthService;
