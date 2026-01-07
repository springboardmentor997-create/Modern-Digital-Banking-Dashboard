from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO


def generate_transaction_pdf_receipt(transaction):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 60

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, y, "Payment Receipt")

    y -= 40
    pdf.setFont("Helvetica", 11)

    fields = [
        ("Transaction ID", transaction.id),
        ("Date", str(transaction.txn_date)),
        ("Description", transaction.description),
        ("Category", transaction.category),
        ("Type", transaction.txn_type.value),
        ("Amount", f"₹ {transaction.amount}"),
        ("Merchant", transaction.merchant or "—"),
        ("Account ID", transaction.account_id),
    ]

    for label, value in fields:
        pdf.drawString(50, y, f"{label}:")
        pdf.drawString(180, y, str(value))
        y -= 22

    y -= 20
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawString(50, y, "This is a system generated receipt.")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return buffer
