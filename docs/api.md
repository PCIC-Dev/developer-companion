# API

Base path: `/api/v1`. Breaking changes get a new version (`/api/v2`), never a
mutation of an existing one.

## Error envelope

Every error response is a single JSON shape (see
`apps/api/src/middleware/error.ts`):

```json
{
  "code": "validation_error",
  "message": "Request body failed validation.",
  "requestId": "6f1c…"
}
```

- `code` — stable, machine-readable string (`not_found`, `validation_error`, …).
- `message` — human-readable; safe to show to developers, not necessarily users.
- `requestId` — correlation id, also returned on the `x-request-id` header, for
  matching a client error to server logs.

Throw an `AppError(status, code, message)` to produce a specific error; anything
else becomes a generic `500 internal_error`.

## Adding a route

1. Create `apps/api/src/routes/v1/<feature>.ts` exporting a `Router`.
2. Validate the body with `validateBody(schema)`, using a schema from
   `@pcic/shared` so the web form and the endpoint share one definition.
3. Protect private or mutating routes with the `requireMember` middleware.
4. Mount it in `apps/api/src/routes/v1/index.ts`:
   `v1Router.use("/<feature>", featureRouter)`.
