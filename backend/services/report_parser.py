import fitz


def extract_pdf_text(
    pdf_path: str
):

    text = ""

    doc = fitz.open(
        pdf_path
    )

    for page in doc:

        text += (
            page.get_text()
            + "\n"
        )

    doc.close()

    return text