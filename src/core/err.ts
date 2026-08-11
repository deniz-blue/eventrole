export class ErrClass {
	constructor(public payload: string) {}
}

export const err = (payload: string) => new ErrClass(payload);
