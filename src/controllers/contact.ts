import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import IdentifyRequestBody from "../types/IdentifyRequestBody";

export const handleIdentifyContact = async (req: Request, res: Response) => {
  const { email, phoneNumber }: IdentifyRequestBody = req.body;
  const prisma = new PrismaClient();

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("contacts: ", contacts);

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
  } catch (error) {
    console.error("Error in /identify endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
