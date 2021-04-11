const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');


const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
// Promisify takes every function which has () => {} in response and returns promise
// override existing function
client.hget = util.promisify(client.hget)
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  // in that case .cache() will be chainable
  return this;
}

// Override existing exec fun which mongoose calls
// Everytime 
mongoose.Query.prototype.exec = async function () {

  // If .cache is not chained execute Query 'normal way'
  if(!this.useCache) {
    return exec.apply(this, arguments);
  }

  // Safely copy one object properties to another
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  // 1) See if we have value for 'key' in redis;
  const cachedValue = await client.hget(this.hashKey, key)

  // 1.1) If we do, return that value
  if(cachedValue) {
    const doc = JSON.parse(cachedValue)
    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
  }

  // 1.2) Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments)

  // EX piration 10 second
  client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 10)

  return result
}


module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey), (err, result) => {
      if(err) {
        console.log('error: ', err)
      }
    })
  }
}