
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { GenerateMagazineOutput } from '@/ai/flows/generate-magazine';

// Register fonts
// Note: In a real app, you would need to host these font files or ensure they are accessible.
// For this example, we assume standard fonts are available.
Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWMI.ttf', fontWeight: 700 },
  ],
});
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2ZL7.woff2', fontWeight: 500 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7.woff2', fontWeight: 700 },
    ],
});


// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#18181b', // zinc-900
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: '#D9274A', // Primary color
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#71717a', // zinc-500
  },
  introduction: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 20,
    textAlign: 'justify',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: '#D9274A',
    marginBottom: 10,
    borderBottom: '2px solid #f4f4f5', // zinc-100
    paddingBottom: 5,
  },
  sectionSummary: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 15,
    textAlign: 'justify',
  },
  articleGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  articleCard: {
    width: '48%',
    border: '1px solid #e4e4e7', // zinc-200
    borderRadius: 8,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
  },
  articleTitle: {
    fontSize: 10,
    padding: 8,
    fontWeight: 500,
  },
   highlightsContainer: {
    backgroundColor: '#fafafa', // zinc-50
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#D9274A',
  },
  highlightItem: {
    fontSize: 11,
    marginBottom: 5,
  },
  sudokuContainer: {
    marginTop: 20,
  },
  sudokuGrid: {
     border: '2px solid #18181b',
  },
  sudokuRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  sudokuCell: {
    width: 25,
    height: 25,
    border: '1px solid #e4e4e7',
    textAlign: 'center',
    lineHeight: 1.5,
    fontSize: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

const SudokuGrid = ({ puzzle }: { puzzle: number[][] }) => (
    <View style={styles.sudokuGrid}>
        {puzzle.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.sudokuRow}>
                {row.map((cell, cellIndex) => (
                    <View key={cellIndex} style={styles.sudokuCell}>
                        <Text>{cell > 0 ? cell : ' '}</Text>
                    </View>
                ))}
            </View>
        ))}
    </View>
);


interface MagazineLayoutProps {
    data: GenerateMagazineOutput;
}

const MagazineLayout = ({ data }: MagazineLayoutProps) => (
  <Document author="Diano Times" title={data.title}>
    {/* --- Cover Page --- */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.date}>Published on {new Date().toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.highlightsContainer}>
        <Text style={styles.highlightsTitle}>In This Issue:</Text>
        {data.highlights.map((highlight, index) => (
          <Text key={index} style={styles.highlightItem}>• {highlight}</Text>
        ))}
      </View>
      
      <Text style={styles.introduction}>{data.introduction}</Text>
      
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
    
    {/* --- Content Pages --- */}
    {data.sections.map((section, sectionIndex) => (
      <Page size="A4" style={styles.page} key={sectionIndex}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionSummary}>{section.summary}</Text>
        
        <View style={styles.articleGrid}>
            {section.articles.map(article => (
                <View key={article.id} style={styles.articleCard}>
                    <Image style={styles.articleImage} src={article.coverImage} />
                    <Text style={styles.articleTitle}>{article.title}</Text>
                </View>
            ))}
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    ))}

    {/* --- Sudoku/Puzzle Page --- */}
     <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Puzzles & Brain Teasers</Text>
        <View style={styles.sudokuContainer}>
             <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>Sudoku Challenge</Text>
             <SudokuGrid puzzle={data.sudoku.puzzle} />
        </View>
         <View style={{ ...styles.sudokuContainer, marginTop: 40 }}>
             <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>Sudoku Solution</Text>
             <SudokuGrid puzzle={data.sudoku.solution} />
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
);

export default MagazineLayout;
