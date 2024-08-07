import { NextFunction, Request, Response } from "express";
import IdentifyRequestBody from "../types/IdentifyRequestBody";

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { email, phoneNumber }: IdentifyRequestBody = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number is required" });
  }
  //   return res.status(200).json({ email, phoneNumber });
  next();
};

export default validateRequest;
