import PDFDocument from 'pdfkit';
import { EducacionCV, ExperienciaCV, ProyectoAcademicoCV, HabilidadesCV } from '../../models/curriculumModel';

// =============================================================================
// ARCHIVO: src/services/pdfService.ts
// Descripción: Servicio de backend responsable de compilar los modelos estructurados
//              del CV en un documento PDF de texto puro. Sin imágenes ni layouts
//              complejos, garantizando un parseo al 100% en sistemas ATS.
// =============================================================================

export interface DatosPerfilUCR {
  nombre: string;
  correo: string;
  telefono?: string;
  linkedin?: string;
  educacion: EducacionCV[];
  experiencia: ExperienciaCV[];
  proyectos: ProyectoAcademicoCV[];
  habilidades: HabilidadesCV | null;
}

// [VERDE - FUNCION: generarPdfAtsFriendly]
// Crea un buffer de memoria con el PDF compilado. Se retorna en Buffer para que
// pueda subirse directo a Supabase Storage (o adjuntarse en un email) sin 
// tener que crear archivos temporales en el disco del servidor.
export async function generarPdfAtsFriendly(perfil: DatosPerfilUCR): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Inicialización limpia: Fuente base segura para ATS y márgenes generosos
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        autoFirstPage: true
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fontRegular = 'Helvetica';
      const fontBold = 'Helvetica-Bold';

      // ── 1. ENCABEZADO (Header) ──
      doc.font(fontBold).fontSize(16).text(perfil.nombre.toUpperCase(), { align: 'center' });
      doc.moveDown(0.2);
      
      const infoContacto = [perfil.correo];
      if (perfil.telefono) infoContacto.push(perfil.telefono);
      if (perfil.linkedin) infoContacto.push(perfil.linkedin);
      
      doc.font(fontRegular).fontSize(10).text(infoContacto.join(' | '), { align: 'center' });
      doc.moveDown(1.5);

      // Helper para renderizar títulos de sección consistentes
      const agregarTituloSeccion = (titulo: string) => {
        doc.font(fontBold).fontSize(12).text(titulo.toUpperCase());
        // Línea divisoria muy básica que no rompe el flujo del ATS
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
        doc.moveDown(0.5);
      };

      // ── 2. EDUCACIÓN ──
      // Se omite secundaria por regla de negocio en modelos.
      if (perfil.educacion && perfil.educacion.length > 0) {
        agregarTituloSeccion('Educación');
        for (const edu of perfil.educacion) {
          doc.font(fontBold).fontSize(10).text(edu.institucion, { continued: true });
          const fechas = `${edu.fecha_inicio} - ${edu.es_actual ? 'Presente' : (edu.fecha_fin || '')}`;
          // Layout ATS-Friendly: Institución [Left] --- Fechas [Right]
          doc.font(fontRegular).text(` | ${fechas}`, { align: 'right' });
          doc.moveDown(0.2);
          doc.font(fontRegular).text(edu.grado_obtenido);
          doc.moveDown(0.5);
        }
      }

      // ── 3. EXPERIENCIA PROFESIONAL (STAR) ──
      if (perfil.experiencia && perfil.experiencia.length > 0) {
        agregarTituloSeccion('Experiencia Laboral');
        for (const exp of perfil.experiencia) {
          doc.font(fontBold).fontSize(10).text(exp.titulo_puesto, { continued: true });
          const fechas = `${exp.fecha_inicio} - ${exp.es_actual ? 'Presente' : (exp.fecha_fin || '')}`;
          doc.font(fontRegular).text(` | ${fechas}`, { align: 'right' });
          doc.font(fontBold).text(exp.empresa);
          doc.moveDown(0.2);
          
          doc.font(fontRegular).fontSize(10);
          for (const vineta of exp.vinetas_star) {
            // Viñetas nativas de PDFKit (caracter punto y espaciado consistente)
            doc.text(`• ${vineta}`, { indent: 15, align: 'justify' });
          }
          doc.moveDown(0.5);
        }
      }

      // ── 4. PROYECTOS ACADÉMICOS ──
      if (perfil.proyectos && perfil.proyectos.length > 0) {
        agregarTituloSeccion('Proyectos Destacados');
        for (const proy of perfil.proyectos) {
          const titulo = proy.url_repositorio ? `${proy.nombre_proyecto} (${proy.url_repositorio})` : proy.nombre_proyecto;
          doc.font(fontBold).fontSize(10).text(titulo);
          doc.font(fontRegular).text(`Tecnologías: ${proy.tecnologias_usadas.join(', ')}`, { indent: 15 });
          doc.text(`• ${proy.descripcion}`, { indent: 15, align: 'justify' });
          doc.moveDown(0.5);
        }
      }

      // ── 5. HABILIDADES ──
      if (perfil.habilidades) {
        agregarTituloSeccion('Habilidades Técnicas y Blandas');
        if (perfil.habilidades.habilidades_tecnicas.length > 0) {
          doc.font(fontBold).fontSize(10).text('Técnicas: ', { continued: true });
          doc.font(fontRegular).text(perfil.habilidades.habilidades_tecnicas.join(', '));
          doc.moveDown(0.2);
        }
        if (perfil.habilidades.habilidades_blandas.length > 0) {
          doc.font(fontBold).fontSize(10).text('Blandas: ', { continued: true });
          doc.font(fontRegular).text(perfil.habilidades.habilidades_blandas.join(', '));
        }
      }

      // Finaliza la compilación del PDF en memoria
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}
