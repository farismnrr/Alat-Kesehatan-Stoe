import type { RenameKeys } from "../utils/model.types";

interface IUser {
	id: string;
	username: string;
	password: string;
	email: string;
	birthdate: Date;
	gender: string;
	address: string;
	city: string;
	contactNumber: string;
}

interface IUserAuth extends IUser {
	accessToken: string;
	refreshToken: string;
}

type IUserMap = RenameKeys<IUser, "contactNumber", "contact_number">;

export type { IUser, IUserAuth, IUserMap };
