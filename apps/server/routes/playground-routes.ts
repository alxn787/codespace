import { Router } from "express";
import { PublishMessage } from "../queue/publisher";
import { authMiddleware } from "../middleware/middleware";
import { prisma } from "db";


const 
router  = Router();

router.post("/playground", authMiddleware, async (req, res) => {
  try{ 
    const { name, environment } = req.body;
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
  
    await PublishMessage(name, environment, containerPort);
  
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
    res.status(201).json({ message: "Playground created" ,
      codespace
    });
  }catch(err){
    res.status(500).json({ message: err });
    return;
  }
});

router.get("/playgrounds", authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const { userId } = req.decodedUser.userId;

    const codespaces = await prisma.playground.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });
    res.status(200).json({ message: "Playgrounds retrieved", codespaces });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});


router.post("/playgrounds/:id", authMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const { userId } = req.decodedUser;

    const { id } = req.params;

    const codespace = await prisma.playground.findFirst({where:{id:id}});
    if(!codespace){
      res.status(404).json({ message: "Playground not found" });
      return;
    }

    if(codespace.userId !== userId){
      res.status(403).json({ message: "You are not authorized to delete this playground" });
      return;
    }
    await prisma.playground.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Playground deleted", codespace });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

export default router;