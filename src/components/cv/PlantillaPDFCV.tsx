'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { DatosCV } from './CVLiveContext';

// Definición de estilos para PDF. Usamos medidas en 'pt' y Helvetica.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#141414',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    color: '#0D4091',
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    color: '#64748B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0D4091',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
    marginBottom: 8,
  },
  itemBlock: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  itemDate: {
    fontSize: 10,
    color: '#64748B',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#141414',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.4,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillColumn: {
    width: '50%',
    paddingRight: 10,
  },
  skillHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginTop: 4,
    marginBottom: 2,
  },
  skillItem: {
    fontSize: 10,
    color: '#334155',
    marginBottom: 2,
  },
  link: {
    color: '#2A8BF6',
    textDecoration: 'none',
  }
});

interface Props {
  datos: DatosCV;
}

export function PlantillaPDFCV({ datos }: Props) {
  const { academic, experiences, skills, certifications } = datos;

  const techSkills = skills?.filter(s => s.skill_type === 'technical') || [];
  const softSkills = skills?.filter(s => s.skill_type === 'soft') || [];
  const langSkills = skills?.filter(s => s.skill_type === 'language') || [];

  // Ordenar experiencias por fecha (asumiendo más reciente primero para el PDF)
  // Como no hay fechas exactas, usamos el array tal cual (el usuario debería ordenarlo, o podemos asumir el orden actual).
  const expList = experiences || [];
  const certList = certifications || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>CURRICULUM VITAE</Text>
          {academic && (
            <>
              <Text style={styles.title}>{academic.career}</Text>
              <Text style={styles.contact}>
                {academic.university} • Nivel: {academic.academic_level} • Año de ingreso: {academic.entry_year}
              </Text>
            </>
          )}
        </View>

        {/* EXPERIENCIA */}
        {expList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            {expList.map((exp, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>
                    {exp.start_month}/{exp.start_year} - {(!exp.end_month || !exp.end_year) ? 'Presente' : `${exp.end_month}/${exp.end_year}`}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{exp.organization}</Text>
                {exp.bullets && exp.bullets.map((b, bIdx) => (
                  <Text key={bIdx} style={styles.itemDesc}>• {b}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* EDUCACION / PROYECTO */}
        {academic && (academic.graduation_project_title || academic.gpa) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación Adicional</Text>
            {academic.gpa && (
              <Text style={styles.itemDesc}>Promedio Ponderado: {academic.gpa}</Text>
            )}
            {academic.graduation_project_title && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.itemTitle}>Proyecto de Graduación: {academic.graduation_project_title}</Text>
                {academic.graduation_project_description && (
                  <Text style={styles.itemDesc}>{academic.graduation_project_description}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* CERTIFICACIONES */}
        {certList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificaciones y Logros</Text>
            {certList.map((cert, i) => (
              <View key={i} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  <Text style={styles.itemDate}>
                    {cert.issued_month}/{cert.issued_year}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{cert.institution}</Text>
                {cert.verification_url && (
                  <Link src={cert.verification_url} style={[styles.itemDesc, styles.link]}>
                    Ver Credencial
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* HABILIDADES E IDIOMAS */}
        {(techSkills.length > 0 || softSkills.length > 0 || langSkills.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades e Idiomas</Text>
            <View style={styles.skillsGrid}>
              
              <View style={styles.skillColumn}>
                {techSkills.length > 0 && (
                  <>
                    <Text style={styles.skillHeader}>Técnicas</Text>
                    {techSkills.map((s, i) => (
                      <Text key={`tech-${i}`} style={styles.skillItem}>• {s.name}</Text>
                    ))}
                  </>
                )}
              </View>

              <View style={styles.skillColumn}>
                {langSkills.length > 0 && (
                  <>
                    <Text style={styles.skillHeader}>Idiomas</Text>
                    {langSkills.map((s, i) => (
                      <Text key={`lang-${i}`} style={styles.skillItem}>• {s.name} - {s.level}</Text>
                    ))}
                  </>
                )}
                {softSkills.length > 0 && (
                  <>
                    <Text style={styles.skillHeader}>Blandas</Text>
                    {softSkills.map((s, i) => (
                      <Text key={`soft-${i}`} style={styles.skillItem}>• {s.name}</Text>
                    ))}
                  </>
                )}
              </View>

            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
