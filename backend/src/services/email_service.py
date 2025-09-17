import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from urllib.parse import urlparse


class EmailService:
    def __init__(self) -> None:
        self.mailer = os.getenv("MAIL_MAILER", "smtp")
        self.host = os.getenv("MAIL_HOST", "localhost")
        self.port = int(os.getenv("MAIL_PORT", "25"))
        self.username = os.getenv("MAIL_USERNAME", "")
        self.password = os.getenv("MAIL_PASSWORD", "")
        self.encryption = os.getenv("MAIL_ENCRYPTION", "")  # tls|ssl|empty
        self.from_name = os.getenv("MAIL_FROM_NAME", "Sinapse Maestro")
        self.from_address = os.getenv("MAIL_FROM_ADDRESS", self.username or "no-reply@example.com")
        self._override: dict | None = None

    def _build_smtp(self) -> smtplib.SMTP:
        host = self._override.get("host") if self._override else self.host
        port = int(self._override.get("port") if (self._override and self._override.get("port") is not None) else self.port)
        encryption = (self._override.get("encryption") if self._override else self.encryption) or ""
        username = self._override.get("username") if self._override else self.username
        password = self._override.get("password") if self._override else self.password

        if str(port) == "465" or str(encryption).lower() == "ssl":
            server = smtplib.SMTP_SSL(host, port)
        else:
            server = smtplib.SMTP(host, port)
            if str(encryption).lower() == "tls":
                server.starttls()
        if username and password:
            server.login(username, password)
        return server

    def send_email(self, *, to: str, subject: str, body: str, attachments: list[dict] | None = None) -> bool:
        if not to:
            print("[email] skipping: destinatário vazio")
            return False
        try:
            host = self._override.get("host") if self._override else self.host
            port = int(self._override.get("port") if (self._override and self._override.get("port") is not None) else self.port)
            encryption = (self._override.get("encryption") if self._override else self.encryption) or ""
            from_name = self._override.get("from_name") if self._override else self.from_name
            from_address = self._override.get("from_address") if self._override else self.from_address
            reply_to = self._override.get("reply_to") if self._override else None
            print(f"[email] enviando para={to} subject={subject!r} via {host}:{port} enc={encryption}")
            msg = MIMEMultipart('mixed')
            msg['Subject'] = subject
            msg['From'] = f"{from_name} <{from_address}>"
            msg['To'] = to
            if reply_to:
                msg.add_header('Reply-To', reply_to)
            alt = MIMEMultipart('alternative')
            part = MIMEText(body or "", 'html', 'utf-8')
            alt.attach(part)
            msg.attach(alt)

            # anexos
            for a in (attachments or []):
                try:
                    file_name = a.get('file_name') or 'arquivo'
                    file_url = a.get('file_url') or a.get('url')
                    content_type = (a.get('content_type') or '').lower()
                    if not file_url:
                        continue
                    data = None
                    # tentar mapear URL local servida por /uploads para caminho de arquivo
                    try:
                        parsed = urlparse(str(file_url))
                        path = parsed.path or ''
                        if path.startswith('/uploads/'):
                            uploads_dir = os.path.join(os.getcwd(), 'uploads')
                            relative = path[len('/uploads/'):]
                            local_path = os.path.join(uploads_dir, relative)
                            if os.path.exists(local_path):
                                with open(local_path, 'rb') as f:
                                    data = f.read()
                    except Exception:
                        pass
                    # fallback: baixar via HTTP
                    if data is None and isinstance(file_url, str) and file_url.startswith('http'):
                        try:
                            import requests
                            r = requests.get(file_url, timeout=15)
                            if r.ok:
                                data = r.content
                        except Exception:
                            data = None
                    # caminho absoluto local
                    if data is None and isinstance(file_url, str) and (file_url.startswith('/') or (len(file_url) > 2 and file_url[1:3] == ':\\')):
                        try:
                            with open(file_url, 'rb') as f:
                                data = f.read()
                        except Exception:
                            data = None
                    if data is None:
                        continue
                    maintype, subtype = ('application', 'octet-stream')
                    if '/' in content_type:
                        parts = content_type.split('/')
                        maintype, subtype = parts[0] or maintype, parts[1] or subtype
                    mime_part = MIMEBase(maintype, subtype)
                    mime_part.set_payload(data)
                    encoders.encode_base64(mime_part)
                    mime_part.add_header('Content-Disposition', 'attachment', filename=file_name)
                    msg.attach(mime_part)
                except Exception:
                    continue

            server = self._build_smtp()
            server.sendmail(from_address, [to], msg.as_string())
            server.quit()
            print(f"[email] enviado com sucesso para={to}")
            return True
        except Exception as e:
            print(f"Email send failed to {to}: {e}")
            return False

    def use_account(self, *, host: str, port: str | int, encryption: str | None, username: str | None, password: str | None, from_name: str | None, from_address: str | None, reply_to: str | None) -> None:
        self._override = {
            "host": host,
            "port": int(port) if port is not None else None,
            "encryption": encryption or "",
            "username": username or "",
            "password": password or "",
            "from_name": from_name or self.from_name,
            "from_address": from_address or (username or self.from_address),
            "reply_to": reply_to or None,
        }

    def reset_account(self) -> None:
        self._override = None

email_service = EmailService()
