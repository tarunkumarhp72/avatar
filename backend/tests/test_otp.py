import pytest

from app.auth.otp import generate_otp, send_otp


class DummySMSProvider:
    def __init__(self) -> None:
        self.sent_messages: list[tuple[str, str]] = []

    async def send_sms(self, phone: str, message: str) -> None:
        self.sent_messages.append((phone, message))


def test_generate_otp() -> None:
    otp = generate_otp()
    assert len(otp) == 4
    assert otp.isdigit()
    
    otp6 = generate_otp(6)
    assert len(otp6) == 6
    assert otp6.isdigit()

@pytest.mark.asyncio
async def test_send_otp() -> None:
    provider = DummySMSProvider()
    phone = "+919876543210"
    otp = "1234"
    
    await send_otp(phone, otp, provider=provider)
    
    assert len(provider.sent_messages) == 1
    assert provider.sent_messages[0][0] == phone
    assert otp in provider.sent_messages[0][1]
