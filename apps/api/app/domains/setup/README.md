# Setup

Setup only saves the selected provider for each type. It has no provider catalog,
registry, credential status fields, or credential validation during selection.

```json
{"type": "storage", "provider": "google_drive"}
```

```json
{"type": "payment", "provider": "stripe"}
```

POST /api/setup/ updates the existing row for that type or creates it. The frontend
uses simple selects and saves on change. Existing metadata fields remain for API
compatibility; name is optional and defaults to the provider ID. Free mode uses
is_active=false on the payment selection.

Keys are configured only in .env. Missing payment keys are reported by the checkout
when the selected gateway is used. Google connection keeps its own OAuth flow.

Setup's storage selection refers to original files. Internal media storage is
configured separately through SYSTEM_STORAGE_PROVIDER and Django STORAGES.
