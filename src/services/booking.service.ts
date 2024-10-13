import { BookingEntity } from "@/entities";
import { AppDataSource } from "@/setup/database.setup";

type BookingCreateRequestType = {
  userId: string;
  carId: string;
  date: Date;
};

export const createBooking = async (
  bookingData: BookingCreateRequestType
): Promise<BookingEntity> => {
  const bookingRepository = AppDataSource.getRepository(BookingEntity);
  const newBooking = new BookingEntity();

  Object.assign(newBooking, bookingData);
  return await bookingRepository.save(newBooking);
};

export const cancelBooking = async (
  bookingId: string
): Promise<boolean | null> => {
  const bookingRepository = AppDataSource.getRepository(BookingEntity);
  const oldBooking: BookingEntity | null = await bookingRepository.findOneBy({
    uuid: bookingId,
  });

  await bookingRepository.softRemove(oldBooking);
  return true;
};

export const getBookingById = async (
  bookingId: string
): Promise<BookingEntity | null> => {
  const bookingRepository = AppDataSource.getRepository(BookingEntity);
  const result = await bookingRepository.findOneBy({
    uuid: bookingId,
  });

  return result;
};

export const getBookingByCar = async (
  carId: string,
  userId: string
): Promise<BookingEntity | null> => {
  const bookingRepository = AppDataSource.getRepository(BookingEntity);
  const result = await bookingRepository.findOneBy({
    carId,
    userId,
  });
  return result;
};
