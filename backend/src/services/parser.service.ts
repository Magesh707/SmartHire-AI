import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as fs from 'fs';

export class ParserService {
  /**
   * Parse PDF and return extracted plain text.
   */
  static async parsePDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text || '';
    } catch (error: any) {
      console.error('Error parsing PDF file:', error);
      throw new Error(`Failed to parse PDF resume: ${error.message}`);
    }
  }

  /**
   * Parse DOCX and return extracted plain text.
   */
  static async parseDOCX(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } catch (error: any) {
      console.error('Error parsing DOCX file:', error);
      throw new Error(`Failed to parse DOCX resume: ${error.message}`);
    }
  }

  /**
   * Automatically select parser based on file extension and return extracted plain text.
   */
  static async parseResume(filePath: string, fileExtension: string): Promise<string> {
    const ext = fileExtension.toLowerCase().replace('.', '');
    if (ext === 'pdf') {
      return this.parsePDF(filePath);
    } else if (ext === 'docx') {
      return this.parseDOCX(filePath);
    } else {
      throw new Error(`Unsupported file type: .${ext}. Only PDF and DOCX formats are supported.`);
    }
  }
}
