import smtplib
from email.message import EmailMessage

EMAIL_ADDRESS = "hp264754@gmail.com"
EMAIL_PASSWORD = "ggsv vjvz vgqq vlnj"  # App Password فقط

def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
