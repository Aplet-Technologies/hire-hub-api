import mongoose from "mongoose";

const resumeModel = new mongoose.Schema(
  {
    resume: { type: String, required: false },
    user_id: { type: String, required: false },
    job_title: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeModel);
export default Resume;
