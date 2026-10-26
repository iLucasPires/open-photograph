# Provider selection and server-managed credentials

Providers are selected through Setup and the frontend as before. Only credentials
are managed by the server environment. Missing integration variables were added
to the ignored local .env without modifying existing secret values. Keys were not
automatically exported from the database.

## Payment

### Client email verification at checkout

```dotenv
CLIENT_REQUIRE_VERIFIED_EMAIL_LINK=True
```

This FlowWi setting requires an allauth-verified email before linking an existing,
unclaimed Client to a user with the same email. It defaults to True. For local
testing, set it to False and restart the API. Restore True for production: with
verification disabled, a user can claim an unlinked client by registering its email.
Clients already linked to another user cannot be claimed in either mode.
This setting does not change allauth's optional signup email verification.

```dotenv
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-endpoint-secret
MERCADO_PAGO_ACCESS_TOKEN=your-mercado-pago-access-token
MERCADO_PAGO_SANDBOX=False
PAYMENT_HOST=api.example.com
PAYMENT_USES_SSL=True
```

Select Stripe or Mercado Pago in Setup. The select only saves the provider ID;
it does not check credential availability. Checkout reports a missing server key
when the selected gateway is used. No secret values are returned to the browser
or accepted through Setup. Free mode deactivates the payment selection.

Existing payments retain their original variant. Keep the original account's key
available for old payments; changing an environment key to another account does
not migrate pending transactions from the previous account.

## Original-file source versus internal system storage

The storage selection in Setup is the original-file source. It does not change
the location of generated or system media. The two configurations are independent.

S3 original sources have separate environment settings:

```dotenv
SOURCE_S3_ACCESS_KEY_ID=your-source-access-key
SOURCE_S3_SECRET_ACCESS_KEY=your-source-secret
SOURCE_S3_BUCKET_NAME=your-originals-bucket
SOURCE_S3_ENDPOINT_URL=
SOURCE_S3_REGION_NAME=us-east-1
```

Internal Django storage saves thumbnails, previews, watermarks and system uploads.
Configure it independently through the environment:

```dotenv
SYSTEM_STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-system-access-key
AWS_SECRET_ACCESS_KEY=your-system-secret
AWS_STORAGE_BUCKET_NAME=your-system-media-bucket
AWS_ENDPOINT_URL=
AWS_S3_REGION_NAME=us-east-1
```

SYSTEM_STORAGE_PROVIDER accepts local or s3 and controls STORAGES["default"].
It never reads the Setup selection. Existing STORAGE_PROVIDER values are accepted
as a fallback, but the new name avoids confusing it with the original-file source.
Moving existing internal media between backends still requires copying the files.
The source catalog does not implement missing integrations; the current gallery
sync/download continues using its existing Google Drive implementation.

## Google login and Drive

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

allauth reads the OAuth application from SOCIALACCOUNT_PROVIDERS. Connecting an
account remains interactive. SocialAccount and SocialToken stay in the database
because access/refresh tokens are generated and refreshed at runtime. Client
secrets are no longer stored in SocialApp or submitted by the frontend.

## Migration

1. Put the existing payment and Google application keys in .env first. Preserve
   the Google client ID so current refresh tokens stay valid.
2. Run `uv run python manage.py migrate`, then restart the API and workers to load
   the environment. Continue selecting providers through Setup.

Migrations remove encrypted credential columns from Order and Setup. They stop
before removing populated credentials if the corresponding provider lacks server
configuration. Legacy Google SocialApp rows are removed to avoid duplicates with
the environment app; accounts and tokens are preserved via SET_NULL. Google keys
must be configured before those rows can be removed. Guards check key presence,
not whether the value belongs to the original account.

POST /api/setup/ saves only the selected provider and its non-secret metadata.
GET /api/setup/ lists the saved choices. No provider catalog endpoint or credential
status metadata is used. Selections are saved independently of server keys.
The CLI remains future work.
