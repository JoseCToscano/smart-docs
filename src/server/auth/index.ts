import { getServerSession } from "next-auth";
import { authConfig } from "./config";

export const auth = async () => {
  const session = await getServerSession(authConfig);
  return session;
};
