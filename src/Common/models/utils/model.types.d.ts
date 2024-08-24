type RenameKeys<T, U extends keyof T, V extends string> = {
	[P in keyof T as P extends U ? V : P]: T[P];
};

type RemoveKeys<T, K extends keyof T> = {
	[P in keyof T as Exclude<P, K>]: T[P];
};

export type { RenameKeys, RemoveKeys };