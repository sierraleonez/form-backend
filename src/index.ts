import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import createError from "http-errors";
import { readFile, utils } from "xlsx";
const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

app.get("/parse", async (req: Request, res: Response) => {
  const file = readFile("./list.xlsx");
  type ParsedParticipant = {
    name: string;
    phone_number: string;
    has_submit: boolean;
  };

  type sheet = {
    NAMA: string;
    PHONE: string;
    NO: string;
  };
  let data: ParsedParticipant[] = [];

  const sheetNames = file.SheetNames;

  sheetNames.forEach((sheet, idx) => {
    const temp = utils.sheet_to_json(file.Sheets[sheetNames[idx]]);
    temp.forEach((res) => {
      const t: sheet = res as sheet;
      if (t.NAMA && t.NO) {
        data.push({
          name: t.NAMA,
          phone_number: String(t.PHONE) || "",
          has_submit: false,
        });
      }
    });
  });
  let result = prisma.participant
    .createMany({
      data,
      skipDuplicates: true,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      res.json({
        message: "Something wrong happened when we insert the",
      });
    });
  res.json({ status: "ok" });
});

app.get("/form-content", async (req: Request, res: Response) => {
  const participant = await prisma.participant.findMany({
		where: {
			has_submit: false
		}
	});
  res.json(participant);
});

app.post("/participant", async (req: Request, res: Response) => {
  const { name, hasSubmit, isComing } = req.body;

  const result = await prisma.participant.create({
    data: {
      name,
      has_submit: hasSubmit,
      is_coming: isComing,
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
      phone_number: phoneNumber,
    },
  });

  res.json(result);
});

// Clear participant
app.delete("/participant", async (req: Request, res: Response) => {
  const result = await prisma.$queryRaw`TRUNCATE table "Participant"`;

  res.json(result);
});

app.use((req: Request, res: Response, next: Function) => {
  next(createError(404));
});

app.listen(process.env.PORT, () =>
  console.log(
    `⚡️[server]: Server is running at https://localhost:${process.env.PORT}`
  )
);
