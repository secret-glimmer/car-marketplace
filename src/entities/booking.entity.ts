import { Entity, Column } from "typeorm";
import { CoreEntity } from "./core.entity";

@Entity("bookings")
export class BookingEntity extends CoreEntity {
  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "car_id" })
  carId: string;

  @Column({ name: "date" })
  date: Date;
}
