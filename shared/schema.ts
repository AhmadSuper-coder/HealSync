import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Doctor/Clinic schema
export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  clinicName: text("clinic_name").notNull(),
  clinicLogo: text("clinic_logo"),
  phone: text("phone"),
  address: text("address"),
  qualifications: text("qualifications"),
  isActive: boolean("is_active").default(true),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Patient schema
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  lifestyle: text("lifestyle"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments schema
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no-show
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prescriptions schema
export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  medicines: jsonb("medicines").notNull(), // Array of {name, dosage, frequency, duration}
  instructions: text("instructions"),
  followUpDate: timestamp("follow_up_date"),
  status: text("status").notNull().default("active"), // active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Bills/Invoices schema
export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  prescriptionId: varchar("prescription_id"), // Link to prescription if applicable
  amount: integer("amount").notNull(), // Amount in cents
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  paymentMethod: text("payment_method"), // cash, upi, card, online
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Patient files/reports schema
export const patientFiles = pgTable("patient_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Treatment progress schema
export const treatmentProgress = pgTable("treatment_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  visitDate: timestamp("visit_date").notNull(),
  symptoms: text("symptoms"),
  improvement: text("improvement"),
  notes: text("notes"),
  nextFollowUp: timestamp("next_follow_up"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertPatientFileSchema = createInsertSchema(patientFiles).omit({
  id: true,
  createdAt: true,
});

export const insertTreatmentProgressSchema = createInsertSchema(treatmentProgress).omit({
  id: true,
  createdAt: true,
});

// Types
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type PatientFile = typeof patientFiles.$inferSelect;
export type InsertPatientFile = z.infer<typeof insertPatientFileSchema>;

export type TreatmentProgress = typeof treatmentProgress.$inferSelect;
export type InsertTreatmentProgress = z.infer<typeof insertTreatmentProgressSchema>;

// Communication methods schema
export const communicationMethods = pgTable("communication_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  patientId: varchar("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  method: text("method").notNull(), // whatsapp, email, sms
  recipient: text("recipient").notNull(), // phone number or email
  subject: text("subject"),
  message: text("message").notNull(),
  cost: integer("cost").default(0), // Cost in paise/cents
  status: text("status").notNull().default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunicationMethodSchema = createInsertSchema(communicationMethods).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export type CommunicationMethod = typeof communicationMethods.$inferSelect;
export type InsertCommunicationMethod = z.infer<typeof insertCommunicationMethodSchema>;

// Feedback/Suggestion schema
export const feedbackRequests = pgTable("feedback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // suggestion, feature, bug
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, planned, in_progress, done, declined
  priority: text("priority"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackRequestSchema = createInsertSchema(feedbackRequests).omit({
  id: true,
  createdAt: true,
});

export type FeedbackRequest = typeof feedbackRequests.$inferSelect;
export type InsertFeedbackRequest = z.infer<typeof insertFeedbackRequestSchema>;

// Announcements schema
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull(), // feature, pricing, update, maintenance
  audience: text("audience").notNull().default("all"), // all or clinic IDs
  isPinned: boolean("is_pinned").default(false),
  activeFrom: timestamp("active_from"),
  activeUntil: timestamp("active_until"),
  readBy: text("read_by").array(), // Array of doctor IDs who have read
  createdBy: varchar("created_by"), // Doctor ID of creator
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Medicine interface for prescriptions
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}