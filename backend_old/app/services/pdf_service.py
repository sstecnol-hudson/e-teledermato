from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from io import BytesIO
import os

class PDFService:
    def generate_case_report(self, case, report, patient):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,
            spaceAfter=20
        )
        elements.append(Paragraph("LAUDO DE TELEDERMATOLOGIA", title_style))
        elements.append(Spacer(1, 12))

        # Patient Info Table
        data = [
            ["PACIENTE:", patient.full_name],
            ["CPF:", patient.cpf],
            ["DATA DO EXAME:", case.created_at.strftime("%d/%m/%Y")],
            ["UNIDADE:", case.health_unit.name if case.health_unit else "UBS Local"]
        ]
        t = Table(data, colWidths=[100, 350])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))

        # Clinical Data
        elements.append(Paragraph("<b>DADOS CLÍNICOS</b>", styles['Heading2']))
        elements.append(Paragraph(f"<b>Localização:</b> {case.lesion_location}", styles['Normal']))
        elements.append(Paragraph(f"<b>Tempo de Evolução:</b> {case.evolution_time}", styles['Normal']))
        elements.append(Paragraph(f"<b>Sintomas:</b> {case.symptoms or 'Nenhum'}", styles['Normal']))
        elements.append(Spacer(1, 15))

        # Images (Optional - for now just placeholders or first image)
        if case.images:
            elements.append(Paragraph("<b>REGISTRO FOTOGRÁFICO</b>", styles['Heading2']))
            # In a real app, we would add the actual images here
            # For this demo, we'll just list them
            for img in case.images:
                elements.append(Paragraph(f"- {img.image_type.capitalize()}", styles['Normal']))
            elements.append(Spacer(1, 15))

        # Report Content
        elements.append(Paragraph("<b>PARECER DO DERMATOLOGISTA</b>", styles['Heading2']))
        elements.append(Paragraph(f"<b>Hipótese Diagnóstica:</b> {report.hypothesis}", styles['Normal']))
        elements.append(Paragraph(f"<b>CID-10:</b> {report.cid10 or 'N/A'}", styles['Normal']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<b>Conduta e Recomendações:</b>", styles['Normal']))
        elements.append(Paragraph(report.conduct, styles['Normal']))
        
        elements.append(Spacer(1, 30))
        
        # Footer
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=1)
        elements.append(Paragraph("Documento gerado eletronicamente via E-Teledermato", footer_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
