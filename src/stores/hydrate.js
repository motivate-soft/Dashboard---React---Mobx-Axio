import { create } from 'mobx-persist';
import { set, get, del, clear } from 'idb-keyval'

// mobx-persist needs localForage-like api, so we're implementing it here
const storage = {
	setItem: set,
	getItem: get,
	removeItem: del,
	clear,
}

export default create({ storage, jsonify: false });
