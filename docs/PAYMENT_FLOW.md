# Avazify payment flow

## Default demo mode (recommended for presentation)

The project defaults to `PAYMENT_PROVIDER=mock`. Unlike an instant fake success, the mock flow now opens a dedicated local payment page so the complete redirect/callback lifecycle can be demonstrated without real money or Internet access.

1. The authenticated user chooses Silver/Gold and a duration.
2. `POST /api/billing/payments/create/` creates a **pending** `PaymentTransaction`.
3. The backend returns `paymentUrl=/payment/mock?...`.
4. React redirects the browser to the mock gateway page.
5. Clicking **successful demo payment** opens the backend callback: `/api/billing/payments/verify/?Authority=...&Status=OK&redirect=1`.
6. The backend verifies the authority with the mock adapter, activates the subscription inside a database transaction, stores the reference id, and creates a notification.
7. The backend redirects the browser to `/payment/result?outcome=success...`.
8. React reloads bootstrap data, so the new subscription is visible immediately.

Cancellation follows the same callback route with `Status=NOK`; the transaction becomes `cancelled` and no subscription is activated.

## Zarinpal sandbox mode

Set in the root `.env`:

```env
PAYMENT_PROVIDER=zarinpal-sandbox
ZARINPAL_MERCHANT_ID=YOUR_36_CHARACTER_MERCHANT_ID
FRONTEND_URL=http://localhost:8080
```

Then restart the backend/container. `payments/create` asks the configured gateway for an authority and returns the gateway StartPay URL. React redirects to that URL. Zarinpal then returns the browser to the backend callback, which verifies the transaction and redirects to the React result page.

> Sandbox availability/endpoints are external-service details. Verify them against the current Zarinpal documentation/account environment before a live presentation. The local mock gateway remains the reliable offline demo.

## Useful demo checks

- Swagger: `/api/docs/`
- Create transaction: `POST /api/billing/payments/create/`
- Verify transaction: `GET /api/billing/payments/verify/`
- UI flow: Settings → Change/upgrade subscription → Confirm and pay → Mock payment page → Successful demo payment → Result page
