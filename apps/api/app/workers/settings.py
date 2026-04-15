from arq.connections import RedisSettings
from app.core.config import settings

# Parse the REDIS_URL "redis://localhost:6379/0" to extract host and port.
url = settings.REDIS_URL
import urllib.parse
parsed = urllib.parse.urlparse(url)

arq_redis_settings = RedisSettings(
    host=parsed.hostname or 'localhost',
    port=parsed.port or 6379,
    database=int(parsed.path.replace('/', '')) if parsed.path else 0
)
