import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Mock patient data
const mockPatients = [
  {
    id: "1",
    name: "Rajesh Sharma",
    phone: "+91 9876543210",
    age: 45,
    gender: "Male",
    address: "123 Main St, Mumbai",
    medicalHistory: "Hypertension, Diabetes",
    prescriptionImages: []
  },
  {
    id: "2",
    name: "Priya Patel",
    phone: "+91 9876543211",
    age: 32,
    gender: "Female",
    address: "456 Park Ave, Pune",
    medicalHistory: "Migraine",
    prescriptionImages: []
  },
  {
    id: "3",
    name: "Amit Kumar",
    phone: "+91 9876543212",
    age: 28,
    gender: "Male",
    address: "789 Garden Rd, Delhi",
    medicalHistory: "Asthma",
    prescriptionImages: []
  }
];

const mockPrescriptions = [
  {
    id: "1",
    patientId: "1",
    patientName: "Rajesh Sharma",
    patientPhone: "+91 9876543210",
    medicines: [
      {
        name: "Arnica 30C",
        dosage: "5 drops",
        frequency: "3 times a day",
        duration: "15 days"
      }
    ],
    instructions: "Take before meals",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    followUpDate: "2024-01-30T10:00:00Z"
  }
];

// Mock bills data
const mockBills = [
  {
    id: "1",
    patientId: "1",
    patientName: "Rajesh Sharma",
    patientPhone: "+91 9876543210",
    prescriptionId: "1",
    amount: 50000, // Amount in paise (₹500)
    description: "Consultation and Homeopathic medicines",
    status: "pending",
    paymentMethod: null,
    createdAt: "2024-01-15T10:30:00Z",
    paidAt: null
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable JSON parsing
  app.use('/api', express.json());

  // OTP verification endpoints
  app.post('/api/send-otp', (req, res) => {
    const { mobile } = req.body;
    console.log(`Sending OTP to ${mobile}`);
    
    // Simulate OTP generation (in real app, this would send SMS)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    res.json({
      success: true,
      message: "OTP sent successfully",
      // In production, don't send OTP in response
      otp: otp // For demo purposes only
    });
  });

  app.post('/api/verify-otp', (req, res) => {
    const { mobile, otp } = req.body;
    console.log(`Verifying OTP ${otp} for ${mobile}`);
    
    // Simulate OTP verification (in real app, verify against stored OTP)
    const isValid = otp === "123456" || otp.length === 6;
    
    res.json({
      success: isValid,
      message: isValid ? "OTP verified successfully" : "Invalid OTP"
    });
  });

  // Patient management endpoints
  app.get('/api/patients', (req, res) => {
    res.json(mockPatients);
  });

  app.get('/api/patients/:id', (req, res) => {
    const patient = mockPatients.find(p => p.id === req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  });

  app.post('/api/patients', (req, res) => {
    const newPatient = {
      id: (mockPatients.length + 1).toString(),
      ...req.body
    };
    mockPatients.push(newPatient);
    res.json(newPatient);
  });

  app.put('/api/patients/:id', (req, res) => {
    const index = mockPatients.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      mockPatients[index] = { ...mockPatients[index], ...req.body };
      res.json(mockPatients[index]);
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  });

  // Send patient info endpoint with PDF upload support
  app.post('/api/patients/:id/send-info', (req, res) => {
    const patient = mockPatients.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    try {
      // Get patient data for PDF generation
      const patientPrescriptions = mockPrescriptions.filter(p => p.patientId === req.params.id);
      const patientBills = mockBills.filter(b => b.patientId === req.params.id);

      // Check if this is a FormData request (with PDF)
      const contentType = req.headers['content-type'] || '';
      const isFormData = contentType.includes('multipart/form-data');
      
      if (isFormData) {
        console.log(`Received PDF upload for patient ${patient.name}`);
        console.log(`Patient has ${patientPrescriptions.length} prescriptions and ${patientBills.length} bills`);
        
        // In a real implementation, this would:
        // 1. Process the uploaded PDF file
        // 2. Store it temporarily or in cloud storage
        // 3. Send via WhatsApp/Email/SMS with PDF attachment
        // 4. Log the communication in the database
        
        console.log(`Sending patient information with PDF to ${patient.name} (${patient.phone})`);
      } else {
        console.log(`Sending patient information to ${patient.name} (${patient.phone})`);
      }
      
      // Simulate successful sending
      res.json({
        success: true,
        message: `Patient information ${isFormData ? 'with PDF report ' : ''}sent successfully to ${patient.name}`,
        recipient: patient.phone,
        method: "whatsapp", // Default to WhatsApp for Indian users
        pdfAttached: isFormData,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending patient info:', error);
      res.status(500).json({ 
        error: "Failed to send patient information",
        message: "An error occurred while processing the request"
      });
    }
  });

  // Prescription endpoints
  app.get('/api/prescriptions', (req, res) => {
    const { patientId } = req.query;
    let prescriptions = mockPrescriptions;
    
    if (patientId) {
      prescriptions = mockPrescriptions.filter(p => p.patientId === patientId);
    }
    
    res.json(prescriptions);
  });

  app.get('/api/prescriptions/:id', (req, res) => {
    const prescription = mockPrescriptions.find(p => p.id === req.params.id);
    if (prescription) {
      res.json(prescription);
    } else {
      res.status(404).json({ error: "Prescription not found" });
    }
  });

  app.post('/api/prescriptions', (req, res) => {
    const newPrescription = {
      id: (mockPrescriptions.length + 1).toString(),
      status: "active",
      createdAt: new Date().toISOString(),
      ...req.body
    };
    mockPrescriptions.push(newPrescription);
    res.json(newPrescription);
  });

  // Update prescription status
  app.patch('/api/prescriptions/:id', (req, res) => {
    const index = mockPrescriptions.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      mockPrescriptions[index] = { 
        ...mockPrescriptions[index], 
        ...req.body
      };
      res.json(mockPrescriptions[index]);
    } else {
      res.status(404).json({ error: "Prescription not found" });
    }
  });

  // Mark all prescriptions as completed for a patient
  app.patch('/api/patients/:patientId/prescriptions/complete', (req, res) => {
    const updated = mockPrescriptions
      .filter(p => p.patientId === req.params.patientId && p.status === 'active')
      .map(p => {
        p.status = 'completed';
        // Remove updatedAt as it's not in the schema
        return p;
      });
    
    res.json({ 
      message: `Marked ${updated.length} prescriptions as completed`,
      updatedCount: updated.length
    });
  });

  // Bills endpoints
  app.get('/api/bills', (req, res) => {
    const { patientId } = req.query;
    let bills = mockBills;
    
    if (patientId) {
      bills = mockBills.filter(b => b.patientId === patientId);
    }
    
    res.json(bills);
  });

  app.get('/api/bills/:id', (req, res) => {
    const bill = mockBills.find(b => b.id === req.params.id);
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  });

  app.post('/api/bills', (req, res) => {
    const newBill = {
      id: (mockBills.length + 1).toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      paidAt: null,
      ...req.body
    };
    mockBills.push(newBill);
    res.json(newBill);
  });

  app.patch('/api/bills/:id', (req, res) => {
    const index = mockBills.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
      const updatedBill = { ...mockBills[index], ...req.body };
      if (req.body.status === "paid") {
        updatedBill.paidAt = new Date().toISOString();
      }
      mockBills[index] = updatedBill;
      res.json(updatedBill);
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  });

  // File upload endpoint
  app.post('/api/upload', (req, res) => {
    // Simulate file upload
    const fileName = `prescription_${Date.now()}.jpg`;
    res.json({
      success: true,
      fileName: fileName,
      url: `/uploads/${fileName}`
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
