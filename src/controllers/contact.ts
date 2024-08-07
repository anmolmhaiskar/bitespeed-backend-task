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

    const primaryContacts = contacts.filter(
      (contact) => contact.linkPrecedence === "primary"
    );
    const secondaryContacts = contacts.filter(
      (contact) => contact.linkPrecedence === "secondary"
    );

    let primaryContact =
      primaryContacts.length > 0
        ? primaryContacts[0]
        : await prisma.contact.findUnique({
            where: { id: contacts[0].linkedId! },
          });
    console.log("primaryContacts: ", primaryContacts);

    const searchedContact = contacts.find((contact) =>
      email == null || phoneNumber == null
        ? contact.email == email || contact.phoneNumber == phoneNumber
        : contact.email == email && contact.phoneNumber == phoneNumber
    );

    if (searchedContact) {
      console.log("searched contact");

      let originalContact;
      if (searchedContact.linkPrecedence == "secondary") {
        originalContact = await prisma.contact.findUnique({
          where: { id: searchedContact.linkedId! },
        });
      } else {
        originalContact = searchedContact;
      }

      const linkedSecondaryontacts = await prisma.contact.findMany({
        where: {
          linkedId: originalContact!.id,
          linkPrecedence: "secondary",
        },
      });

      const emails = Array.from(
        new Set([
          primaryContact!.email,
          ...linkedSecondaryontacts.map((c) => c.email),
        ])
      );
      const phoneNumbers = Array.from(
        new Set([
          primaryContact!.phoneNumber,
          ...linkedSecondaryontacts.map((c) => c.phoneNumber),
        ])
      );
      const secondaryContactIds = linkedSecondaryontacts.map((c) => c.id);

      return res.json({
        contact: {
          primaryContactId: originalContact!.id,
          emails,
          phoneNumbers,
          secondaryContactIds,
        },
      });
    }

    if (primaryContacts.length == 1) {
      console.log("primaryContacts.length == 1");
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact!.id,
          linkPrecedence: "secondary",
        },
      });

      const linkedSecondaryontacts = await prisma.contact.findMany({
        where: {
          linkedId: primaryContact!.id,
          linkPrecedence: "secondary",
        },
      });

      const emails = Array.from(
        new Set([
          primaryContact!.email,
          ...linkedSecondaryontacts.map((c) => c.email),
        ])
      );
      const phoneNumbers = Array.from(
        new Set([
          primaryContact!.phoneNumber,
          ...linkedSecondaryontacts.map((c) => c.phoneNumber),
        ])
      );
      const secondaryContactIds = linkedSecondaryontacts.map((c) => c.id);

      return res.json({
        contact: {
          primaryContactId: primaryContact!.id,
          emails,
          phoneNumbers,
          secondaryContactIds,
        },
      });
    }

    if (primaryContacts.length > 1) {
      console.log("primaryContacts.length > 1");
      const primary1 = primaryContacts.find(
        (contact) => contact.email == email
      );
      const primary2 = primaryContacts.find(
        (contact) => contact.phoneNumber == phoneNumber
      );

      console.log("primary1", primary1);
      console.log("primary2", primary2);
      // Update primary2 to be secondary
      await prisma.contact.update({
        where: { id: primary2!.id },
        data: {
          linkedId: primary1!.id,
          linkPrecedence: "secondary",
        },
      });

      // Update secondary contacts linked to primary2
      const secondaryContactsLinkedToPrimary2 = await prisma.contact.findMany({
        where: { linkedId: primary2!.id },
      });

      await Promise.all(
        secondaryContactsLinkedToPrimary2.map(async (secondaryContact) => {
          await prisma.contact.update({
            where: { id: secondaryContact.id },
            data: {
              linkedId: primary1!.id,
            },
          });
        })
      );

      console.log(
        primary1!.email,
        primary2?.email,
        new Set([
          primary1!.email,
          primary2!.email,
          ...secondaryContactsLinkedToPrimary2.map((contact) => contact.email),
        ])
      );

      return res.json({
        contact: {
          primaryContactId: primary1!.id,
          emails: Array.from(
            new Set([
              primary1!.email,
              primary2!.email,
              ...secondaryContactsLinkedToPrimary2.map(
                (contact) => contact.email
              ),
            ])
          ),
          phoneNumbers: Array.from(
            new Set([
              primary1!.phoneNumber,
              primary2!.phoneNumber,
              ...secondaryContactsLinkedToPrimary2.map(
                (contact) => contact.phoneNumber
              ),
            ])
          ),
          secondaryContactIds: [
            primary2!.id,
            ...secondaryContactsLinkedToPrimary2.map((c) => c.id),
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error in /identify endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
