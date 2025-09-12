import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Mock patient data
const mockPatients = [
  {
    id: "1",
    name: "Rajesh Sharma",
    mobile: "+91 9876543210",
    age: 45,
    gender: "Male",
    address: "123 Main St, Mumbai",
    medicalHistory: "Hypertension, Diabetes",
    prescriptionImages: []
  },
  {
    id: "2",
    name: "Priya Patel",
    mobile: "+91 9876543211",
    age: 32,
    gender: "Female",
    address: "456 Park Ave, Pune",
    medicalHistory: "Migraine",
    prescriptionImages: []
  },
  {
    id: "3",
    name: "Amit Kumar",
    mobile: "+91 9876543212",
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
    patientMobile: "+91 9876543210",
    medicines: [
      {
        name: "Arnica 30C",
        dosage: "5 drops",
        frequency: "3 times a day",
        duration: "15 days"
      }
    ],
    instructions: "Take before meals",
    date: "2024-01-15",
    followUpDate: "2024-01-30"
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

  // Prescription endpoints
  app.get('/api/prescriptions', (req, res) => {
    res.json(mockPrescriptions);
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
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    mockPrescriptions.push(newPrescription);
    res.json(newPrescription);
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
