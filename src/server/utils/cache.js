import Cache from 'node-cache';

const cache = new Cache({
  stdTTL: 86400 // default TTL to 1 day (this can be overwritten on set)
});

export default cache;
