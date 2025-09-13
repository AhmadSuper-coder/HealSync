import { type Doctor, type InsertDoctor, type FeedbackRequest, type InsertFeedbackRequest, type Announcement, type InsertAnnouncement } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByEmail(email: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedbackRequest): Promise<FeedbackRequest>;
  listFeedback(doctorId?: string): Promise<FeedbackRequest[]>;
  updateFeedbackStatus(id: string, status: string): Promise<FeedbackRequest | undefined>;
  
  // Announcement methods
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  listAnnouncements(since?: Date): Promise<Announcement[]>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  markAnnouncementRead(id: string, doctorId: string): Promise<Announcement | undefined>;
}

export class MemStorage implements IStorage {
  private doctors: Map<string, Doctor>;
  private feedbackRequests: Map<string, FeedbackRequest>;
  private announcements: Map<string, Announcement>;

  constructor() {
    this.doctors = new Map();
    this.feedbackRequests = new Map();
    this.announcements = new Map();
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
      isAdmin: insertDoctor.isAdmin || false,
      clinicLogo: insertDoctor.clinicLogo || null,
      phone: insertDoctor.phone || null,
      address: insertDoctor.address || null,
      qualifications: insertDoctor.qualifications || null
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedbackRequest): Promise<FeedbackRequest> {
    const id = randomUUID();
    const feedback: FeedbackRequest = {
      ...insertFeedback,
      id,
      createdAt: new Date(),
      status: insertFeedback.status || "open"
    };
    this.feedbackRequests.set(id, feedback);
    return feedback;
  }

  async listFeedback(doctorId?: string): Promise<FeedbackRequest[]> {
    const allFeedback = Array.from(this.feedbackRequests.values());
    if (doctorId) {
      return allFeedback.filter(feedback => feedback.doctorId === doctorId);
    }
    return allFeedback;
  }

  async updateFeedbackStatus(id: string, status: string): Promise<FeedbackRequest | undefined> {
    const feedback = this.feedbackRequests.get(id);
    if (feedback) {
      feedback.status = status;
      this.feedbackRequests.set(id, feedback);
      return feedback;
    }
    return undefined;
  }

  // Announcement methods
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      createdAt: new Date(),
      publishedAt: new Date(),
      readBy: []
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async listAnnouncements(since?: Date): Promise<Announcement[]> {
    const allAnnouncements = Array.from(this.announcements.values());
    if (since) {
      return allAnnouncements.filter(announcement => 
        announcement.publishedAt && announcement.publishedAt >= since
      );
    }
    return allAnnouncements.sort((a, b) => 
      (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0)
    );
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (announcement) {
      Object.assign(announcement, updates);
      this.announcements.set(id, announcement);
      return announcement;
    }
    return undefined;
  }

  async markAnnouncementRead(id: string, doctorId: string): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (announcement) {
      if (!announcement.readBy?.includes(doctorId)) {
        announcement.readBy = [...(announcement.readBy || []), doctorId];
        this.announcements.set(id, announcement);
      }
      return announcement;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
