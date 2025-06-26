import { Router } from "express";
import { prisma } from "db";
import { LoginSchema, SignupSchema } from "schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const router = Router();

router.post("/signup", async (req,res)=>{
    
    const parsedInput = SignupSchema.safeParse(req.body);

    if(!parsedInput.success){
        res.status(400).json(parsedInput.error.message);
        return;
    }

    const { username, email, password } = parsedInput.data;

    const UserExists = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if(UserExists){
        res.status(400).json("User already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if(parsedInput.success){
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password_hash: hashedPassword,
            },
        });
        res.status(201).json({user});
    }

})

router.post("/login", async(req, res)=>{
    const parsedInput = LoginSchema.safeParse(req.body);
        if(!parsedInput.success){
            res.status(400).json(parsedInput.error.message);
            return;
        }
        const { email, password } = parsedInput.data;

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if(!user){
            res.status(400).json("User not found");
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if(!isPasswordCorrect){
            res.status(400).json("Incorrect password");
            return;
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET??"secret");
        res.cookie('userAccessToken', token, {
        maxAge: 1000 * 60 * 60 * 24 * 10,
        httpOnly: true,
      })
      .json({ message: 'User logged in' });
});

router.get("/", async(req, res)=>{
    res.json("hello");
})

export default router;