
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractMeetingText(
  file: Express.Multer.File,
): Promise<string> {
  let text = "";

  if (
    file.mimetype === "text/plain" ||
    file.originalname.toLowerCase().endsWith(".txt")
  ) {
    text = file.buffer.toString("utf-8");
  } else if (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    const parser = new PDFParse({ data: file.buffer });

    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.originalname.toLowerCase().endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    text = result.value;
  } else {
    throw new Error("Unsupported meeting file type. Upload a PDF, DOCX, or TXT file.");
  }

  const cleanedText = text.replace(/\u0000/g, "").trim();

 

  if (!cleanedText) {
    throw new Error(
      "No readable text was found in this file. If it is a scanned PDF, OCR is required.",
    );
  }

  return cleanedText;
}
