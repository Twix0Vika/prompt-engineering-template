# Development mock authentication

The frontend mock-auth mode is enabled only when Vite is running in development
and `VITE_DEV_AUTH_BYPASS=true` is set in the frontend environment.

If a development frontend sends requests to the FastAPI backend instead of
using its local mock API, start the backend with both
`APP_ENV=development` and `VITE_DEV_AUTH_BYPASS=true`. The backend accepts the
fake `dev-only-mock-token` only under those explicit settings. Never enable
these settings in production.

The mock account uses the syntactically valid placeholder address
`dev@example.com`; it is not a real account.
