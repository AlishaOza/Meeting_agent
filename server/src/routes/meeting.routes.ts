import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  createAction,
  listMeetingActions,
} from "../controllers/action.controller";

import {
  analyzeMeeting,
  createMeeting,
  deleteMeeting,
  getMeeting,
  listMeetings,
  updateMeeting,
  updateMeetingNotes,
  updateMeetingSummary,
} from "../controllers/meeting.controller";

import { meetingFileUpload } from "../middleware/upload";

const router = Router();

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => req.userId ?? "anonymous",
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Analysis limit reached. Please try again later.",
  },
});

// Meetings
router.get("/", listMeetings);

router.post(
  "/",
  meetingFileUpload.single("file"),
  createMeeting
);

router.get("/:id", getMeeting);

router.put("/:id", updateMeeting);

router.delete("/:id", deleteMeeting);

// AI Analysis
router.post(
  "/:id/analyze",
  analyzeLimiter,
  analyzeMeeting
);

// Editable AI / meeting content
router.put("/:id/notes", updateMeetingNotes);
router.put("/:id/summary", updateMeetingSummary);

// Action Items
router.get("/:id/actions", listMeetingActions);
router.post("/:id/actions", createAction);

export default router;