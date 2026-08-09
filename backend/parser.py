from pathlib import Path
from pypdf import PdfReader
from docx import Document


def read_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)

    text = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text.append(page_text)

    return "\n".join(text)


def read_docx(file_path: str) -> str:
    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n".join(paragraphs)


def read_txt(file_path: str) -> str:
    return Path(file_path).read_text(
        encoding="utf-8",
        errors="ignore"
    )


def read_document(file_path: str) -> str:
    path = Path(file_path)

    extension = path.suffix.lower()

    if extension == ".pdf":
        return read_pdf(file_path)

    if extension == ".docx":
        return read_docx(file_path)

    if extension == ".txt":
        return read_txt(file_path)

    raise ValueError(
        "Unsupported file type. Use PDF, DOCX or TXT."
    )