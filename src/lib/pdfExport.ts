import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exporta el contenido de un elemento HTML a un archivo PDF.
 * @param elementId ID del elemento contenedor a exportar
 * @param filename Nombre del archivo a descargar
 */
export const exportToPDF = async (elementId: string, filename: string = 'dashboard.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento con ID ${elementId} no encontrado`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Mejora la calidad de la imagen
      useCORS: true, // Permite cargar imágenes externas
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
  }
};
