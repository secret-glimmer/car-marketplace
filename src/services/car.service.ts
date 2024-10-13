import { BookingEntity, CarEntity } from "@/entities";
import { AppDataSource } from "@/setup/database.setup";

type CarRequestType = {
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
};

interface CarListReturnType extends CarEntity {
  bookingCount: number;
}

export const createCar = async (
  carData: CarRequestType
): Promise<CarEntity> => {
  const carRepository = AppDataSource.getRepository(CarEntity);
  const newCar = new CarEntity();

  Object.assign(newCar, carData);
  return await carRepository.save(newCar);
};

export const searchCars = async (
  filters: CarRequestType
): Promise<CarListReturnType[]> => {
  const carRepository = AppDataSource.getRepository(CarEntity);

  const carsWithBookingCount = await carRepository
    .createQueryBuilder("car")
    .leftJoinAndSelect(BookingEntity, "booking", "booking.car_id = car.uuid")
    .select([
      "car.uuid AS uuid",
      "car.make AS make",
      "car.model AS model",
      "car.year AS year",
      "car.price AS price",
      "car.mileage AS mileage",
      "COUNT(booking.uuid) AS bookingCount",
    ])
    .where(filters)
    .groupBy("car.uuid")
    .getRawMany();

  return carsWithBookingCount;
};

export const getCarById = async (carId: string): Promise<CarEntity | null> => {
  const carRepository = AppDataSource.getRepository(CarEntity);
  const result = await carRepository.findOneBy({
    uuid: carId,
  });

  return result;
};
