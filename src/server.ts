import dotenv from "dotenv";
import express from "express";
import contactRouter from "./routes/contactRoute";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use("/identify", contactRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
