import PDFParser from "pdf2json";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // O segundo parâmetro '1' habilita a extração de texto bruto (Raw Text)
    const pdfParser = new (PDFParser as any)(null, 1);
    
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError?.message || "Erro desconhecido no PDF"));
    });
    
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      let text = pdfParser.getRawTextContent();
      
      // Se o raw text falhar, tentamos extrair manualmente dos campos de texto
      if (!text || text.trim().length === 0) {
        let manualText = "";
        pdfData.Pages.forEach((page: any) => {
          page.Texts.forEach((t: any) => {
            t.R.forEach((r: any) => {
              manualText += decodeURIComponent(r.T);
            });
            manualText += " ";
          });
          manualText += "\n";
        });
        text = manualText;
      } else {
        // O raw text costuma vir com caracteres de escape, vamos decodificar
        text = decodeURIComponent(text);
      }
      
      resolve(text);
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

export async function extractText(
  buffer: Buffer,
  type: "PDF" | "DOCX" | "MD" | "TXT"
): Promise<string> {
  switch (type) {
    case "PDF":
      return extractTextFromPDF(buffer);
    case "DOCX":
      return extractTextFromDOCX(buffer);
    case "MD":
    case "TXT":
      return extractTextFromTXT(buffer);
    default:
      throw new Error(`Tipo de arquivo não suportado: ${type}`);
  }
}
