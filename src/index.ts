import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import createError from "http-errors";
import { readFile, utils } from "xlsx";
import Joi from "joi";
import { validate_middleware } from "./middleware/validator";

dotenv.config();

// Initiate connection to prisma, it using DATABASE_KEY inside .env to connect
const prisma = new PrismaClient();

const app = express();

// Middleware
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
  try {
    const participant = await prisma.participant.findMany({
      where: {
        has_submit: false,
      },
    });
    res.json(participant);
  } catch (err) {
    res.json({
      message: "something is wrong",
    });
  }
});

app.post("/participant", async (req: Request, res: Response) => {
  try {
    const { name, hasSubmit, isComing } = req.body;
    const result = await prisma.participant.create({
      data: {
        name,
        has_submit: hasSubmit,
        is_coming: isComing,
      },
    });
    res.json(result);
  } catch (err) {
    res.json({
      message: "something is wrong..",
    });
  }
});

const form_schema = Joi.object({
  participantId: Joi.number().required(),
  isComing: Joi.boolean().required(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  paymentMethod: Joi.string().required(),
  paymentPicUrl: Joi.string().optional(),
  foodOption: Joi.string().required(),
});

app.post(
  "/form",
  validate_middleware(form_schema),
  async (req: Request, res: Response) => {
    try {
      const {
        participantId,
        isComing,
        email,
        phoneNumber,
        paymentMethod,
        paymentPicUrl,
        foodOption,
      } = req.body;
      const result = await prisma.participant.update({
        where: { id: participantId },
        data: {
          has_submit: true,
          email,
          is_coming: isComing,
          phone_number: phoneNumber,
          payment_image_url: paymentPicUrl,
          payment_method: paymentMethod,
          food_option: foodOption,
        },
      });

      res.json(result);
    } catch (err) {
      res.json({
        message: "something is wrong",
      });
    }
  }
);

app.get("/participant", async (req: Request, res: Response) => {
  try {
    const isComing = req.query.coming === "true";
    const participant = await prisma.participant.findMany({
      where: {
        ...(req.query.coming !== undefined && { has_submit: isComing }),
      },
    });
    res.json(participant);
  } catch (err) {
    console.log(err);
    res.json({ message: "something is wrong..." });
  }
});

// Clear participant
// Development purpose only
app.delete("/participant", async (_: Request, res: Response) => {
  const result = await prisma.$queryRaw`TRUNCATE table "Participant"`;

  res.json(result);
});

app.use((_: Request, __: Response, next: Function) => {
  next(createError(404));
});

app.listen(process.env.PORT, () =>
  console.log(
    `⚡️[server]: Server is running at https://localhost:${process.env.PORT}`
  )
);
