import fetch from '../utils/uniform-fetch';

export const fetchManifest = () => {
    return fetch(`${ API }/manifest.json`)
        .then(([data, resp]) => ({
            data
        }));
};
