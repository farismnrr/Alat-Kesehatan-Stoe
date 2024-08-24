import type { IUser, IUserMap } from "../../types";

const MapUser = (user: IUserMap): IUser => {
	return {
		id: user.id,
		username: user.username,
		password: user.password,
		email: user.email,
		birthdate: user.birthdate,
		gender: user.gender,
		address: user.address,
		city: user.city,
		contactNumber: user.contact_number
	};
};

export { MapUser };