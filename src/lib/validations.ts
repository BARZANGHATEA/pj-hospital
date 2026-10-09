import { z } from "zod"

// Persian messages for the generic errors that the schemas below don't override.
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    return { message: issue.received === "undefined" ? "تکمیل همه فیلدهای الزامی ضروری است" : "مقدار واردشده معتبر نیست" }
  }
  return { message: ctx.defaultError }
})

const email = z.string().trim().toLowerCase().email("ایمیل معتبر نیست")
const password = z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد").max(128)
const optionalText = (max: number) => z.string().trim().max(max).optional().default("")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "رمز عبور را وارد کنید"),
})

export const patientRegisterSchema = z.object({
  role: z.literal("patient"),
  name: z.string().trim().min(2, "نام را وارد کنید").max(100),
  email,
  password,
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "جنسیت را انتخاب کنید" }) }),
  age: z.coerce.number().int().min(0, "سن معتبر نیست").max(130, "سن معتبر نیست"),
  medicalHistory: optionalText(2000),
  currentMedications: optionalText(2000),
})

export const doctorRegisterSchema = z.object({
  role: z.literal("doctor"),
  name: z.string().trim().min(2, "نام را وارد کنید").max(100),
  email,
  password,
  specialty: z.string().trim().min(1, "تخصص را انتخاب کنید").max(100),
  licenseNumber: z.string().trim().min(3, "شماره نظام پزشکی معتبر نیست").max(30),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "شماره تماس معتبر نیست"),
  clinicAddress: optionalText(300),
  bio: optionalText(1000),
})

export const registerSchema = z.discriminatedUnion("role", [patientRegisterSchema, doctorRegisterSchema])

export const chatMessageSchema = z.object({
  text: z.string().trim().min(1, "پیام خالی است").max(4000, "پیام بیش از حد طولانی است"),
})

export const medicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: z.string().trim().min(1).max(200),
  duration: z.string().trim().min(1).max(200),
})

export const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  diagnosis: z.string().trim().max(2000).optional(),
  medications: z.array(medicationSchema).max(20).optional(),
  doctorNotes: z.string().trim().max(2000).optional(),
}).refine((v) => v.action !== "reject" || (v.doctorNotes && v.doctorNotes.length > 0), {
  message: "برای رد نسخه، توضیح برای بیمار الزامی است",
  path: ["doctorNotes"],
})
