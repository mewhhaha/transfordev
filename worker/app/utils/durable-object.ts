import { DurableObject } from 'cloudflare:workers';

export const $get = <NAMESPACE extends DurableObject>(
	namespace: DurableObjectNamespace<NAMESPACE>,
	id: { id: string } | { name: string } | DurableObjectId,
) => {
	let doid: DurableObjectId;
	if ('equals' in id) {
		doid = id;
	} else if ('id' in id) {
		doid = namespace.idFromString(id.id);
	} else {
		doid = namespace.idFromName(id.name);
	}

	return namespace.get(doid);
};
