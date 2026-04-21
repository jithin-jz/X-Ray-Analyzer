import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from jinja2 import Environment, FileSystemLoader

from backend.config import settings

# Setup Jinja2 environment
template_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "templates",
    "email",
)

env = Environment(loader=FileSystemLoader(template_dir))


def send_email(to_email: str, subject: str, html_body: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(
            f"⚠️ SMTP credentials not configured. Skipping email to {to_email}. "
            "Ensure .env is loaded."
        )
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
    subject = "Your AI X-Ray Analyzer Verification Code"
    template = env.get_template("otp.html")
    body = template.render(otp=otp)
    send_email(to_email, subject, body)


def send_magic_link_email(to_email: str, token: str, origin: str):
    subject = "Reset Your AI X-Ray Analyzer Password"
    magic_link = f"{origin}/magic-login?token={token}"
    template = env.get_template("magic_link.html")
    body = template.render(magic_link=magic_link)
    send_email(to_email, subject, body)
