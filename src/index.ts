import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv'
import cors from 'cors'
import express, { Request, Response } from "express";
import createError from "http-errors";

const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(express.json());
app.use(cors())
app.get("/form-content", async (req: Request, res: Response) => {
  const participant = await prisma.participant.findMany();
  res.json(participant);
});

app.post("/participant", async (req: Request, res: Response) => {
  const { name, hasSubmit, isComing } = req.body;
  const result = await prisma.participant.create({
    data: {
      name,
      has_submit: hasSubmit,
			is_coming: isComing
    },
  });
  res.json(result);
});

app.post("/form", async (req: Request, res: Response) => {
  const { participantId, isComing, email, phoneNumber } = req.body;

  const result = await prisma.participant.update({
    where: { id: participantId },
		data: {
			has_submit: true,
			email,
			is_coming: isComing,
			phone_number: phoneNumber
		}
  });

  res.json(result);
});

app.use((req: Request, res: Response, next: Function) => {
  next(createError(404));
});

app.listen(process.env.PORT, () =>
  console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`)
);
