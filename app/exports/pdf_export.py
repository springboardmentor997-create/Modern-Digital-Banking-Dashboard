"""
PDF Export Utility

What:
- Generates PDF receipt for a transaction

Backend Connections:
- Used by exports router
- Uses Transaction ORM

Frontend Connections:
- PaymentSuccess.jsx
- Download receipt button
"""

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from fastapi.responses import StreamingResponse
from io import BytesIO

from app.models.transaction import Transaction


def generate_transaction_pdf(transaction: Transaction):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 60

    # -----------------------
    # HEADER
    # -----------------------
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, y, "Payment Receipt")

    y -= 40
    pdf.setFont("Helvetica", 11)

    fields = [
        ("Transaction ID", transaction.id),
        ("Date", transaction.txn_date.strftime("%Y-%m-%d")),
        ("Description", transaction.description),
        ("Category", transaction.category),
        ("Type", transaction.txn_type.value),
        ("Amount", f"₹ {transaction.amount}"),
        ("Currency", transaction.currency),
        ("Account ID", transaction.account_id),
    ]

    for label, value in fields:
        pdf.drawString(50, y, f"{label}:")
        pdf.drawString(200, y, str(value))
        y -= 22

    y -= 20
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawString(50, y, "This is a system generated receipt.")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=transaction_{transaction.id}.pdf"
        }
    )
