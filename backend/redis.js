const Redis = require("ioredis");

const redis = new Redis("redis://127.0.0.1:6379");

redis.on("connect", () => {
    console.log("Redis Connected");
});

redis.on("error", (error) => {
    console.log("Redis Error:", error.message);
});

module.exports = redis;