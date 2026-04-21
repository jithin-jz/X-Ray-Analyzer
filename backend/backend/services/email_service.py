import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.config import settings


def send_email(to_email: str, subject: str, html_body: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(
            f"⚠️ SMTP credentials not configured. Skipping email to {to_email}. "
            "Ensure .env is loaded."
        )

        print(f"Subject: {subject}\nBody: {html_body}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI X-Ray Analyzer <{settings.SMTP_USER}>"
    msg["To"] = to_email

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


def send_otp_email(to_email: str, otp: str):
    subject = "Verify Your Account"
    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                   padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #6366f1;">AI X-Ray Analyzer</h2>
        <p>Thank you for registering! Please use the 6-digit OTP below to verify your
           email address:</p>
        <h1 style="font-size: 36px; letter-spacing: 4px; color: #333;">{otp}</h1>
        <p style="color: #888; font-size: 12px;">If you did not request this, please
           ignore this email.</p>
      </body>
    </html>
    """
    send_email(to_email, subject, body)


def send_magic_link_email(to_email: str, token: str, origin: str):
    subject = "Recover Your Account"
    magic_link = f"{origin}/magic-login?token={token}"
    body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;
                   padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">AI X-Ray Analyzer Account Recovery</h2>
        <p>We received a request to access your account without a password or
           passkey.</p>
        <p>Click the secure magic link below to instantly log in and set up a new
           passkey:</p>
        <a href="{magic_link}" style="display: inline-block; padding: 12px 24px;
           background: #8b5cf6; color: white; text-decoration: none;
           border-radius: 6px; font-weight: bold; margin: 20px 0;">Sign In Securely</a>
        <p style="color: #888; font-size: 12px;">This link will expire soon. Do not
           share it with anyone.</p>
      </body>
    </html>
    """
    send_email(to_email, subject, body)
