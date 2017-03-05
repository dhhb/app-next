import config from 'c0nfig';
import createApiClient from 'api-client-js';

const api = createApiClient(config.apiUrl);

export default api;
