import { Router, type IRouter } from "express";
import healthRouter from "./health";
import billingSyncRouter from "./billing-sync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(billingSyncRouter);

export default router;
