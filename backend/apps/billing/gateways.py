from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlencode

import requests
from django.conf import settings


@dataclass
class GatewayRequestResult:
    authority: str
    payment_url: str


class MockPaymentGateway:
    name = "mock"

    def request(self, transaction, callback_url):
        authority = f"mock-{transaction.id}"
        query = urlencode({
            "authority": authority,
            "transaction": str(transaction.id),
            "tier": transaction.plan.tier,
            "duration": transaction.duration_months,
            "amount": transaction.amount,
        })
        payment_url = f"{settings.FRONTEND_URL.rstrip('/')}/payment/mock?{query}"
        return GatewayRequestResult(authority=authority, payment_url=payment_url)

    def verify(self, transaction, authority):
        expected = f"mock-{transaction.id}"
        if authority != expected:
            raise RuntimeError("شناسه تراکنش آزمایشی معتبر نیست.")
        return f"MOCK-{str(transaction.id).split('-')[0].upper()}"


class ZarinpalSandboxGateway:
    name = "zarinpal-sandbox"
    request_url = "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
    verify_url = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
    start_url = "https://sandbox.zarinpal.com/pg/StartPay/{authority}"

    def request(self, transaction, callback_url):
        if not settings.ZARINPAL_MERCHANT_ID:
            raise RuntimeError("ZARINPAL_MERCHANT_ID تنظیم نشده است.")
        payload = {
            "merchant_id": settings.ZARINPAL_MERCHANT_ID,
            "amount": transaction.amount * 10,
            "callback_url": callback_url,
            "description": f"Avazify {transaction.plan.display_name} subscription",
            "metadata": {"email": transaction.user.email},
        }
        response = requests.post(self.request_url, json=payload, timeout=15)
        response.raise_for_status()
        data = response.json().get("data") or {}
        authority = data.get("authority")
        if not authority:
            raise RuntimeError("درگاه پرداخت Authority برنگرداند.")
        return GatewayRequestResult(authority=authority, payment_url=self.start_url.format(authority=authority))

    def verify(self, transaction, authority):
        payload = {
            "merchant_id": settings.ZARINPAL_MERCHANT_ID,
            "amount": transaction.amount * 10,
            "authority": authority,
        }
        response = requests.post(self.verify_url, json=payload, timeout=15)
        response.raise_for_status()
        data = response.json().get("data") or {}
        if data.get("code") not in {100, 101}:
            raise RuntimeError("تراکنش توسط درگاه تأیید نشد.")
        return str(data.get("ref_id") or authority)


def get_gateway(provider: str | None = None):
    selected_provider = provider or settings.PAYMENT_PROVIDER
    if selected_provider == "zarinpal-sandbox":
        return ZarinpalSandboxGateway()
    if selected_provider == "mock":
        return MockPaymentGateway()
    raise RuntimeError(f"درگاه پرداخت ناشناخته است: {selected_provider}")
