export const tryCatch = async <T>(promise: Promise<T>): Promise<[T, null] | [null, unknown]> => {
	try {
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null, error];
	}
};

export const trynull = async <T>(promise: Promise<T>): Promise<T | null> => {
	try {
		return await promise;
	} catch {
		return null;
	}
};
