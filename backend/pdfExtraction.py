from PyPDF2 import PdfReader

def read_pdf(file_path: str) -> str:
    """
    Reads and extracts text from a PDF file.

    :param file_path: Path to the PDF file.
    :return: Extracted text as a string.
    """
    # Initialize a PdfReader object
    reader = PdfReader(file_path)
    
    # Extract text from each page
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    
    return text