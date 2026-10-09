import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import actionRoutes from "./action.routes";
import authRoutes from "./auth.routes";
import meetingRoutes from "./meeting.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes); // public
router.use("/meetings", requireAuth, meetingRoutes); // protected
router.use("/actions", requireAuth, actionRoutes); // protected

export default router;