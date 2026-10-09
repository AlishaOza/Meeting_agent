import { Router } from "express";
import { deleteAction, listActions, updateAction } from "../controllers/action.controller";

const router = Router();

router.get("/", listActions);
router.patch("/:id", updateAction);
router.delete("/:id", deleteAction);

export default router;