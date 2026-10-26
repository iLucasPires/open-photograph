# Included originals

Gallery creation/editing separates included delivery from optional extra sales:

- `none`: existing galleries keep their current behavior.
- `all`: all original JPEGs are downloadable by anyone with access to the
  published gallery. Sales and individual purchases are disabled. Private
  gallery access codes still apply; no allowance or client assignment is needed.
- `photographer`: staff mark individual photos with `is_included`. Anyone with
  access to the published gallery can download those JPEG originals. Marked
  photos have no individual sale price in the public API. Preview download
  permissions remain separate.
- `client`: `included_photo_limit` is an allowance per linked client account.
  Clients must log in with the email of a Client linked to the gallery. The
  normal email verification rule applies when claiming an unlinked Client.
  At least one linked Client is required when creating or updating this mode.

Disabling extra sales preserves the delivery mode, allowance and linked clients.
Included photos can still be chosen and downloaded without a payment provider.
Linked clients and a positive limit remain required in client-choice mode even
when extra sales are disabled.

Clients explicitly confirm each choice with `POST /api/galleries/public/{slug}/included/`
and `photo_id`. Choices cannot be swapped after delivery. The service locks the
gallery row to serialize concurrent claims, and repeated claims are idempotent.
Previously paid photos cannot consume an allowance. Lowering the limit or changing
the mode preserves existing client choices and original access.

`GET /api/galleries/public/{slug}/photos/{photo_id}/original/` checks the gallery's
publication/access code and the current user's entitlement before opening the
original. Originals use the same source-delivery service as purchased downloads.
Private-gallery codes are still required on claim and download requests.

The public gallery exposes `included_eligible`, `included_remaining` and each
photo's `can_download_original`. It never exposes another client's choices.
Extra photos use the existing individual purchase flow and configured prices.
When extra sales are enabled in client-choice mode, individual sales are enabled
automatically and a default individual price for extras is required when saving
the gallery. Exhausting the allowance does not turn off individual purchases.

The gallery package deducts the actual amounts of approved individual purchases
in the same currency, using the original item price snapshots. Refunded, pending,
other-currency purchases and included choices do not create a monetary credit.
The deduction is capped at the package price. A zero balance creates an approved
zero-total package without contacting the payment provider. Included originals
appear alongside paid orders on the client's purchases page.

Apply the additive migration with `python manage.py migrate` before running the
updated API. No existing galleries or photos are automatically marked free.

## Preview quality

Admin Settings → Previews controls global WebP quality (40–100, default 85) and
preview maximum side (800–4096 px, default 1920). The aspect ratio is preserved
and smaller sources are never enlarged. Thumbnails retain a 400 px maximum
side, using the configured quality. Watermarked output uses the same quality.

`GET/PATCH /api/gallery-preview-settings/` is staff-only. Saving affects future
processing; it does not alter existing files. `POST` on the same endpoint queues
reprocessing of existing ready photos with an original source and source account.
The worker must be running and able to read those originals. Downloaded original
JPEGs are never resized or recompressed by these settings.
