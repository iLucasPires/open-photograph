from django.conf import settings
from django.db import DatabaseError, connection
from django.http import JsonResponse
from redis import Redis
from redis.exceptions import RedisError


def health(request):
    """Readiness probe for Railway: database and queue must be reachable."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        with Redis.from_url(settings.REDIS_URL, socket_connect_timeout=2, socket_timeout=2) as redis:
            redis.ping()

    except (DatabaseError, RedisError):
        return JsonResponse({"status": "unavailable"}, status=503)

    return JsonResponse({"status": "ok"})
