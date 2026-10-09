import mongoose, { type InferSchemaType, type Model } from "mongoose"

const MessageSchema = new mongoose.Schema({
  from: { type: String, enum: ["patient", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const ChatSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, default: "مشاوره جدید" },
  // open: patient is talking to the assistant
  // submitted: summary sent to doctors, waiting for review
  // reviewed: a doctor approved or rejected the prescription
  status: { type: String, enum: ["open", "submitted", "reviewed"], default: "open" },
  messages: [MessageSchema],
  symptomsSummary: { type: String },
}, { timestamps: true })

export type ChatDoc = InferSchemaType<typeof ChatSchema>

const Chat = (mongoose.models.Chat as Model<ChatDoc>) || mongoose.model<ChatDoc>("Chat", ChatSchema)
export default Chat
