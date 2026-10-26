from django.conf import settings
from django.http import FileResponse, Http404
from django.views.decorators.http import require_safe


@require_safe
def frontend(request):
    index = settings.FRONTEND_ROOT / "index.html"

    if not index.is_file():
        raise Http404("Frontend build unavailable.")

    response = FileResponse(index.open("rb"), content_type="text/html")
    response["Cache-Control"] = "no-cache"

    return response
