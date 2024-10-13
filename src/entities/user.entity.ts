import { Entity, Column } from "typeorm";
import { CoreEntity } from "./core.entity";

@Entity("users")
export class UserEntity extends CoreEntity {
  @Column({ name: "username", unique: true })
  username: string;

  @Column({ name: "password" })
  password: string;

  @Column({ name: "role", default: "user" })
  role: string;
}
