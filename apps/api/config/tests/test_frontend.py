from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import SimpleTestCase
from django.urls import Resolver404, resolve, reverse


class FrontendRoutingTests(SimpleTestCase):
    def test_spa_routes_serve_index(self):
        with TemporaryDirectory() as directory:
            frontend_root = Path(directory)
            (frontend_root / "index.html").write_text("<html>FlowWi</html>", encoding="utf-8")
            with self.settings(FRONTEND_ROOT=frontend_root, SECURE_SSL_REDIRECT=False):
                for route in ("/", "/admin/galleries", "/g/example"):
                    with self.subTest(route=route):
                        response = self.client.get(route)
                        self.assertEqual(response.status_code, 200)
                        self.assertEqual(b"".join(response.streaming_content), b"<html>FlowWi</html>")
                        self.assertEqual(response["Cache-Control"], "no-cache")

    def test_backend_urls_use_api_prefix(self):
        self.assertEqual(reverse("admin:index"), "/api/admin/")
        self.assertEqual(reverse("health"), "/api/health/")
        self.assertTrue(reverse("google_callback").startswith("/api/allauth/"))

    def test_missing_api_or_asset_does_not_resolve_to_spa(self):
        for route in ("/api/unknown/", "/assets/missing.js"):
            with self.subTest(route=route), self.assertRaises(Resolver404):
                resolve(route)

    def test_spa_rejects_mutations(self):
        with self.settings(SECURE_SSL_REDIRECT=False):
            self.assertEqual(self.client.post("/admin/galleries").status_code, 405)
