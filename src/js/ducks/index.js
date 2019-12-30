import { Registrar } from './utils';
import * as initializers from './init';
import * as calculator from './calculator';
import * as data from './data';
import * as settings from './settings';

export const actions = new Registrar({
	...calculator.actions,
	...data.actions,
	...settings.actions
});

export const reducers = new Registrar({
    ...initializers.reducers(),
    ...calculator.reducers(),
    ...data.reducers(),
    ...settings.reducers()
});

export const sagas = new Registrar([
    ...initializers.sagas,
    ...calculator.sagas
]);
