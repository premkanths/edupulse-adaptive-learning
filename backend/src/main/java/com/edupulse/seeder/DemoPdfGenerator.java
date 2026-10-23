package com.edupulse.seeder;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class DemoPdfGenerator {

    /**
     * Generates an official university Course Material / Lecture Note PDF document.
     */
    public static byte[] generatePdf(String title, String subtitle, List<String> paragraphs) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 750;

                // Title
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 15);
                cs.newLineAtOffset(50, y);
                cs.showText(sanitize(title));
                cs.endText();
                y -= 22;

                // Subtitle / Course info
                if (subtitle != null && !subtitle.isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText(sanitize(subtitle));
                    cs.endText();
                    y -= 22;
                }

                // Decorative horizontal divider
                cs.setLineWidth(1.0f);
                cs.moveTo(50, y);
                cs.lineTo(550, y);
                cs.stroke();
                y -= 22;

                // Paragraphs
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                for (String p : paragraphs) {
                    if (y < 65) {
                        break;
                    }
                    cs.beginText();
                    cs.newLineAtOffset(50, y);
                    cs.showText(sanitize(p));
                    cs.endText();
                    y -= 15;
                }

                // Institutional Footer
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 8);
                cs.newLineAtOffset(50, 40);
                cs.showText("EduPulse Academic Intelligence Platform - Department of Computer Science & Engineering");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            return ("PDF Document: " + title + "\n" + subtitle).getBytes();
        }
    }

    /**
     * Generates an authentic evaluated student exam paper script PDF with teacher marks and diagnostics.
     */
    public static byte[] generateExamPaperPdf(String studentName, String email, String section,
                                             String examTitle, String subject, double score, double maxScore,
                                             String grade, String feedback, String teacherName,
                                             List<String> mistakes) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 750;

                // Institutional Banner
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                cs.newLineAtOffset(50, y);
                cs.showText("OFFICIAL EVALUATED EXAMINATION ANSWER SCRIPT");
                cs.endText();
                y -= 18;

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
                cs.newLineAtOffset(50, y);
                cs.showText(sanitize(examTitle + " - " + subject));
                cs.endText();
                y -= 18;

                // Student Metadata Banner
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                cs.newLineAtOffset(50, y);
                cs.showText(sanitize(String.format("Candidate: %s (%s) | Class: %s", studentName, email, section)));
                cs.endText();
                y -= 15;

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                cs.newLineAtOffset(50, y);
                cs.showText(sanitize(String.format("Evaluated by: %s | Date: %s", teacherName, java.time.LocalDate.now().toString())));
                cs.endText();
                y -= 18;

                // Evaluation Score Box
                cs.setLineWidth(1.2f);
                cs.moveTo(50, y);
                cs.lineTo(550, y);
                cs.stroke();
                y -= 22;

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, y);
                cs.showText(sanitize(String.format("SCORE: %.1f / %.1f (%.1f%%)  --  GRADE: %s", score, maxScore, (score / maxScore) * 100.0, grade)));
                cs.endText();
                y -= 20;

                // Faculty Feedback Section
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                cs.newLineAtOffset(50, y);
                cs.showText("Instructor Evaluation Summary:");
                cs.endText();
                y -= 16;

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                List<String> feedbackLines = wrapText(feedback, 90);
                for (String fl : feedbackLines) {
                    if (y < 65) break;
                    cs.beginText();
                    cs.newLineAtOffset(50, y);
                    cs.showText(sanitize(fl));
                    cs.endText();
                    y -= 14;
                }
                y -= 10;

                // Question Mistake Attribution & Pedagogical Diagnosis
                if (mistakes != null && !mistakes.isEmpty()) {
                    cs.beginText();
                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                    cs.newLineAtOffset(50, y);
                    cs.showText("Evaluated Question Attributions & Deductions:");
                    cs.endText();
                    y -= 16;

                    cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                    for (String m : mistakes) {
                        if (y < 65) break;
                        cs.beginText();
                        cs.newLineAtOffset(50, y);
                        cs.showText(sanitize("- " + m));
                        cs.endText();
                        y -= 14;
                    }
                }

                // Official Digital Verification Stamp
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 8);
                cs.newLineAtOffset(50, 40);
                cs.showText("Verified by EduPulse Evaluated Exam Script Diagnosis Engine. Recorded in Academic Archive.");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            return ("Evaluated Exam Script: " + examTitle + " for " + studentName + " - Score: " + score + "/" + maxScore).getBytes();
        }
    }

    private static String sanitize(String input) {
        if (input == null) return "";
        String cleaned = input.replaceAll("[^\\x20-\\x7E]", " ").trim();
        if (cleaned.length() > 95) {
            cleaned = cleaned.substring(0, 92) + "...";
        }
        return cleaned;
    }

    private static List<String> wrapText(String text, int maxLineLength) {
        if (text == null || text.isEmpty()) return List.of();
        java.util.List<String> lines = new java.util.ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder current = new StringBuilder();
        for (String w : words) {
            if (current.length() + w.length() + 1 > maxLineLength) {
                lines.add(current.toString());
                current = new StringBuilder(w);
            } else {
                if (current.length() > 0) current.append(" ");
                current.append(w);
            }
        }
        if (current.length() > 0) {
            lines.add(current.toString());
        }
        return lines;
    }
}
