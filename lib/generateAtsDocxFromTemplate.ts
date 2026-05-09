import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { DynamicATSResume } from "./types";
import { mapResumeToTemplateData } from "./atsTemplateMapping";

const TEMPLATE_PATH = "/templates/johnson_resume_template.docx";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const hasTemplatePlaceholders = (zip: PizZip): boolean => {
  const documentXml = zip.file("word/document.xml")?.asText() ?? "";

  return documentXml.includes("{") && documentXml.includes("}");
};

export const generateDynamicATSDocxFromTemplate = async (
  resume: DynamicATSResume
): Promise<Blob> => {
  const response = await fetch(TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error(`Template could not be loaded from ${TEMPLATE_PATH}`);
  }

  const templateBuffer = await response.arrayBuffer();
  const zip = new PizZip(templateBuffer);
  if (!hasTemplatePlaceholders(zip)) {
    throw new Error(
      `Template at ${TEMPLATE_PATH} does not contain replacement placeholders`
    );
  }

  const templateData = mapResumeToTemplateData(resume);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });

  doc.render(templateData);

  return doc.getZip().generate({
    type: "blob",
    mimeType: DOCX_MIME,
  }) as Blob;
};
