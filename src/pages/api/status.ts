import { NextApiRequest , NextApiResponse } from "next";
import nextConnect from "next-connect";
import { dbConnectMiddleware } from "@/middleware/dbConnectMidlleware";

export default nextConnect()
.use(dbConnectMiddleware)
.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error in status API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
