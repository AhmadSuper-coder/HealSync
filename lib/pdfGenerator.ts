import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Patient, Prescription, Bill, Medicine } from '@shared/schema';

interface PatientPDFData {
  patient: Patient;
  prescriptions: Prescription[];
  bills: Bill[];
}

export function generatePatientPDF({ patient, prescriptions, bills }: PatientPDFData): jsPDF {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('HomeoClinic - Patient Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  let yPosition = 50;
  
  // Patient Information Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Patient Information', 20, yPosition);
  yPosition += 10;
  
  const patientInfo = [
    ['Name', patient.name],
    ['Age', `${patient.age} years`],
    ['Gender', patient.gender],
    ['Phone', patient.phone || ''],
    ['Email', patient.email || ''],
    ['Address', patient.address || ''],
    ['Emergency Contact', patient.emergencyContact || ''],
    ['Allergies', patient.allergies || 'None'],
    ['Medical History', patient.medicalHistory || 'None'],
    ['Lifestyle', patient.lifestyle || 'None']
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Information']],
    body: patientInfo,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: 20, right: 20 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  // Prescriptions Section
  if (prescriptions.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Prescriptions', 20, yPosition);
    yPosition += 10;
    
    prescriptions.forEach((prescription, index) => {
      doc.setFontSize(14);
      doc.text(`Prescription ${index + 1} - ${prescription.status.toUpperCase()}`, 20, yPosition);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(prescription.createdAt || new Date()).toLocaleDateString()}`, 20, yPosition + 8);
      yPosition += 18;
      
      const medicineData = (prescription.medicines as Medicine[]).map((medicine) => [
        medicine.name,
        medicine.dosage,
        medicine.frequency,
        medicine.duration
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Medicine', 'Dosage', 'Frequency', 'Duration']],
        body: medicineData,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      
      if (prescription.instructions) {
        doc.setFontSize(10);
        doc.text('Instructions:', 20, yPosition);
        yPosition += 6;
        const splitInstructions = doc.splitTextToSize(prescription.instructions, 170);
        doc.text(splitInstructions, 20, yPosition);
        yPosition += splitInstructions.length * 4 + 5;
      }
      
      if (prescription.followUpDate) {
        doc.setFontSize(10);
        const followUpDate = typeof prescription.followUpDate === 'string' ? prescription.followUpDate : prescription.followUpDate.toISOString();
        doc.text(`Follow-up Date: ${new Date(followUpDate).toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
      }
      
      yPosition += 10;
      
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }
  
  // Billing Section
  if (bills.length > 0) {
    // Add new page for billing if needed
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Billing Information', 20, yPosition);
    yPosition += 10;
    
    const billData = bills.map((bill) => [
      new Date(bill.createdAt || new Date()).toLocaleDateString(),
      bill.description,
      `₹${bill.amount.toLocaleString()}`,
      bill.status.toUpperCase(),
      bill.paymentMethod || '-',
      bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : '-'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Description', 'Amount', 'Status', 'Payment Method', 'Paid Date']],
      body: billData,
      theme: 'striped',
      headStyles: { fillColor: [217, 83, 79] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // Summary
    const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
    const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Billing Summary:', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`Total Paid: ₹${totalPaid.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Pending: ₹${totalPending.toLocaleString()}`, 20, yPosition);
  }
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    doc.text('HomeoClinic - Confidential Patient Information', 20, doc.internal.pageSize.height - 10);
  }
  
  return doc;
}

export function downloadPatientPDF(data: PatientPDFData): void {
  const doc = generatePatientPDF(data);
  const fileName = `${data.patient.name.replace(/\s+/g, '_')}_PatientReport_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function getPatientPDFBlob(data: PatientPDFData): Blob {
  const doc = generatePatientPDF(data);
  return doc.output('blob');
}