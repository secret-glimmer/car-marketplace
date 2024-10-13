import { Logger } from "@/utils";
import { MESSAGES } from "@/consts";
import { backendSetup } from "@/setup";
import { AppDataSource } from "@/setup/database.setup";
import "dotenv/config";

const setupServer = async () => {
  try {
    await AppDataSource.initialize();
    Logger.info(MESSAGES.DATABASE_CONNECTION_SUCCESS);
  } catch (error: unknown) {
    Logger.info(MESSAGES.DATABASE_CONNECTION_FAILURE);
    Logger.error(error);

    process.exit(0);
  }

  try {
    await backendSetup();
  } catch (error: unknown) {
    Logger.info(MESSAGES.SERVER_RUN_FAILURE);
    Logger.error(error);
  }
};

setupServer();
