import asyncio
import structlog
from redis.asyncio import Redis
from app.core.config import settings

logger = structlog.get_logger(__name__)

class RedisClient:
    def __init__(self):
        self._redis: Redis | None = None

    async def connect(self):
        if not self._redis:
            self._redis = Redis.from_url(
                settings.REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True
            )
            logger.info("redis_connected", url=settings.REDIS_URL)

    async def disconnect(self):
        if self._redis:
            await self._redis.close()
            self._redis = None
            logger.info("redis_disconnected")

    @property
    def client(self) -> Redis:
        if not self._redis:
            raise RuntimeError("Redis client not connected. Call connect() first.")
        return self._redis

    async def set_json(self, key: str, value: dict, expire: int = 3600):
        import json
        await self.client.set(key, json.dumps(value), ex=expire)

    async def get_json(self, key: str) -> dict | None:
        import json
        data = await self.client.get(key)
        if data:
            return json.loads(data)
        return None

    async def delete(self, key: str):
        await self.client.delete(key)

redis_client = RedisClient()
