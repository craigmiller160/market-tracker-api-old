type WithMongooseId<T extends Record<string, unknown>> = T & {
	__v?: number;
	_id?: string;
};

export const removeId = <T>(withMongooseId: WithMongooseId<T>): T => {
	const newObj = { ...withMongooseId };
	delete newObj.__v;
	delete newObj._id;
	return newObj;
};
