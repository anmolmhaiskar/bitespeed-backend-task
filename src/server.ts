import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import IdentifyRequestBody from "./types/IdentifyRequestBody";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.post("/identify", async (req, res) => {
  const { email, phoneNumber }: IdentifyRequestBody = req.body;

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [{ email }, { phoneNumber }],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (contacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });
    return res.json({
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
