import { Router } from "express";
import { PublishMessage } from "../queue/publisher";


const router  = Router();

router.post("/playground", async (req, res) => {
  const { name, environment, port } = req.body;

  await PublishMessage(name, environment, port);

  res.status(201).json({ message: "Playground created" });
});

export default router;