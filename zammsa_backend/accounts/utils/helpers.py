import pyotp
import qrcode
import base64
from io import BytesIO
from django.conf import settings


def generate_mfa_secret():
    return pyotp.random_base32()


def get_mfa_provisioning_uri(user, secret):
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=user.email, issuer_name='ZAMMSA Procurement')


def generate_qr_code_base64(uri):
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()


def verify_mfa_code(secret, code):
    totp = pyotp.TOTP(secret)
    return totp.verify(code)
