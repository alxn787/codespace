import { Router } from "express";
import { PublishMessage } from "../queue/publisher";
import { authMiddleware } from "../middleware/middleware";
import { prisma } from "db";


const 
router  = Router();

router.post("/playground", authMiddleware, async (req, res) => {
  const { name, environment, port } = req.body;
  //@ts-ignore
  const decodedUser = req.decodedUser;
  const userId = decodedUser.userId;
  let template = environment;
  let containerImage = "";
  let containerPort = 5001;
  if (template === "reactjs") {
    containerImage = "alxn787/react-codespace:2";
    containerPort = 5173;
  } else if (template === "nodejs") {
    containerImage = "alxn787/node-codespace:2";
    containerPort = 5001;
  }
  console.log(containerImage, containerPort,decodedUser);

  const codespace = await prisma.playground.create({
    data: {
      title: name,
      template: environment,
      containerPort: containerPort,
      containerImage: "alxn787/react-codespace:2",
      user: {
          connect: {
            id: userId,
          },
        },
    },
  });
  await PublishMessage(name, environment, port);

  res.status(201).json({ message: "Playground created" ,
    codespace
  });
});

export default router;