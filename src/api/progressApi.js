import api from "./axios";

// Fetches a student's course progress checklist (lessons grouped by module).
export const getStudentChecklist = (studentId) =>
  api.get(`/students/${studentId}/checklist/`);

// Marks a lesson as completed for a student (with remarks).
export const updateLessonProgress = (studentId, data) =>
  api.post(`/students/${studentId}/checklist/`, data);
