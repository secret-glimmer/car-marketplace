import { UserEntity } from "@/entities";
import { AppDataSource } from "@/setup/database.setup";

type CreateUserRequestType = {
  username: string;
  password: string;
  role: string;
};

export const register = async (
  userData: CreateUserRequestType
): Promise<UserEntity> => {
  const userRepository = AppDataSource.getRepository(UserEntity);
  const newUser = new UserEntity();

  Object.assign(newUser, userData);
  return await userRepository.save(newUser);
};

export const getUser = async (username: string): Promise<UserEntity> => {
  const userRepository = AppDataSource.getRepository(UserEntity);
  const user: UserEntity | null = await userRepository.findOneBy({
    username,
  });
  return user;
};
