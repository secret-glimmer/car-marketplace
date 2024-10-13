import { Entity, Column } from "typeorm";
import { CoreEntity } from "./core.entity";

@Entity("cars")
export class CarEntity extends CoreEntity {
  @Column({ name: "make" })
  make: string;

  @Column({ name: "model" })
  model: string;

  @Column({ name: "year" })
  year: string;

  @Column({ name: "price" })
  price: number;

  @Column({ name: "mileage" })
  mileage: number;
}
