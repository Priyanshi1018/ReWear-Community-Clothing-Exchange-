import { dbConnect } from "@/lib/dbConnect";


export const dbConnectMiddleware = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
};