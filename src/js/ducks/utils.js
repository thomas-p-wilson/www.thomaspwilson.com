export class Registrar {
	constructor(unregistered, listeners) {
		this.registered = unregistered || {};
		this.listeners = listeners || [];
	}

	getRegistered() {
		return this.registered;
	}
	register(unregistered) {
		const is_unregistered_array = Array.isArray(unregistered);
		const is_registered_array = Array.isArray(this.registered);
		if (is_unregistered_array !== is_registered_array) {
			throw new Error('Newly-registered elements must be an ' + (is_registered_array ? 'array' : 'object'));
		}
		if (is_registered_array) {
			this.registered.push(...unregistered);
		} else {
			Object.assign(this.registered, unregistered);
		}
		this.notify(this.registered, unregistered);
	}
	addListener(listener) {
		this.listeners.push(listener);
	}
	removeListener(listener) {
		let index;
		while (index = this.listeners.indexOf(item) !== -1) {
			this.listeners.splice(index, 1);
		}
	}
	notify(registered, unregistered) {
		this.listeners.forEach((listener) => (listener(registered, unregistered)));
	}
}
