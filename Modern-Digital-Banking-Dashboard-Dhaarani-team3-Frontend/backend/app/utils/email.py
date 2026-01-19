def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Local email sender stub — prints the message to console.

    Later this can be replaced with an SMTP implementation.
    """
    print("📧 TO:", to_email)
    print("📧 SUBJECT:", subject)
    print("📧 BODY:\n", body)
