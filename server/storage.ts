import { type Doctor, type InsertDoctor } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByEmail(email: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
}

export class MemStorage implements IStorage {
  private doctors: Map<string, Doctor>;

  constructor() {
    this.doctors = new Map();
  }

  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorByEmail(email: string): Promise<Doctor | undefined> {
    return Array.from(this.doctors.values()).find(
      (doctor) => doctor.email === email,
    );
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = randomUUID();
    const doctor: Doctor = { 
      ...insertDoctor, 
      id, 
      createdAt: new Date(), 
      isActive: true,
      clinicLogo: insertDoctor.clinicLogo || null,
      phone: insertDoctor.phone || null,
      address: insertDoctor.address || null,
      qualifications: insertDoctor.qualifications || null
    };
    this.doctors.set(id, doctor);
    return doctor;
  }
}

export const storage = new MemStorage();
