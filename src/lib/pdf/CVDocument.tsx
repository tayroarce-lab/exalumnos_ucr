import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Nota: En producción, es ideal registrar fuentes TrueType (TTF) para que el ATS las lea sin problemas.
// Font.register({ family: 'Open Sans', src: 'https://fonts.gstatic.com/s/opensans/v34/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTSKmu1aB.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica', // ATS friendly core font
    fontSize: 11,
    color: '#333',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  contactInfo: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontWeight: 'bold',
    color: '#111',
  },
  entrySubtitle: {
    fontStyle: 'italic',
    color: '#444',
  },
  entryDate: {
    fontSize: 10,
    color: '#666',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
  },
  skillsText: {
    marginBottom: 2,
  }
});

interface CVDocumentProps {
  data: any; // Se reemplazará con el tipo estructurado (getFullCvData)
}

export const CVDocument = ({ data }: CVDocumentProps) => {
  const { profile, academic, experiences, skills, certifications } = data;
  
  // Formatters
  const formatMonthYear = (m: number | null, y: number | null) => {
    if (!y) return 'Presente';
    if (!m) return `${y}`;
    return `${m.toString().padStart(2, '0')}/${y}`;
  };

  const techSkills = skills?.filter((s: any) => s.skill_type === 'technical') || [];
  const softSkills = skills?.filter((s: any) => s.skill_type === 'soft') || [];
  const languages = skills?.filter((s: any) => s.skill_type === 'language') || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* Contact Info Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.user_metadata?.nombre || 'Nombre del Estudiante'}</Text>
          <Text style={styles.contactInfo}>{profile?.email || 'email@example.com'}</Text>
          {profile?.telefono && <Text style={styles.contactInfo}>{profile.telefono}</Text>}
          {profile?.linkedin && <Text style={styles.contactInfo}>{profile.linkedin}</Text>}
        </View>

        {/* Academic Info */}
        {academic && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            <View style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{academic.university}</Text>
                <Text style={styles.entryDate}>{academic.entry_year} - Presente</Text>
              </View>
              <Text style={styles.entrySubtitle}>{academic.academic_level} en {academic.career}</Text>
              {academic.gpa && <Text>Promedio Ponderado: {academic.gpa}</Text>}
              {academic.graduation_project_title && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Proyecto de Graduación: {academic.graduation_project_title}</Text>
                  <Text>{academic.graduation_project_description}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Experience & Projects */}
        {experiences && experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia y Proyectos</Text>
            {experiences.map((exp: any) => (
              <View key={exp.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.title}</Text>
                  <Text style={styles.entryDate}>{formatMonthYear(exp.start_month, exp.start_year)} - {formatMonthYear(exp.end_month, exp.end_year)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{exp.organization} ({exp.experience_type})</Text>
                
                {exp.bullets && exp.bullets.map((b: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            {techSkills.length > 0 && (
              <Text style={styles.skillsText}>
                <Text style={{ fontWeight: 'bold' }}>Técnicas: </Text>
                {techSkills.map((s: any) => `${s.name} (${s.level})`).join(', ')}
              </Text>
            )}
            {softSkills.length > 0 && (
              <Text style={styles.skillsText}>
                <Text style={{ fontWeight: 'bold' }}>Blandas: </Text>
                {softSkills.map((s: any) => s.name).join(', ')}
              </Text>
            )}
            {languages.length > 0 && (
              <Text style={styles.skillsText}>
                <Text style={{ fontWeight: 'bold' }}>Idiomas: </Text>
                {languages.map((s: any) => `${s.name} (${s.level})`).join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificaciones</Text>
            {certifications.map((cert: any) => (
              <View key={cert.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{cert.name}</Text>
                  <Text style={styles.entryDate}>{formatMonthYear(cert.issued_month, cert.issued_year)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{cert.institution}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
