import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientsRouter from "./clients";
import dealsRouter from "./deals";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);
router.use(dealsRouter);
router.use(tasksRouter);
router.use(dashboardRouter);
router.use(aiRouter);

export default router;
