class EmailService:
    def send_email(self, *, to: str, subject: str, body: str) -> bool:
        # Placeholder de envio de e-mail
        # Em produção, integrar com um provedor (SendGrid, SES, etc.)
        print(f"Sending email to {to} | subject={subject}")
        return True

email_service = EmailService()
