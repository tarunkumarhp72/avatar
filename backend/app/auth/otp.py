import random
from typing import Protocol


class SMSProvider(Protocol):
    async def send_sms(self, phone: str, message: str) -> None:
        ...

class MockSMSProvider:
    async def send_sms(self, phone: str, message: str) -> None:
        # In a real app, this would use Twilio, Msg91, SNS, etc.
        # For now, just log it.
        import structlog
        structlog.get_logger().info("sms_sent", phone=phone, message=message)

# Dependency injection for the provider
def get_sms_provider() -> SMSProvider:
    return MockSMSProvider()

def generate_otp(length: int = 4) -> str:
    """Generate a numeric OTP of specified length."""
    return "".join(str(random.randint(0, 9)) for _ in range(length))

async def send_otp(phone: str, otp: str, provider: SMSProvider | None = None) -> None:
    if provider is None:
        provider = MockSMSProvider()
    message = f"Your Avatar login code is: {otp}. Do not share this code."
    await provider.send_sms(phone, message)
