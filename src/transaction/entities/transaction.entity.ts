import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "transaction" })
export class Transaction {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "text",
    nullable: false,
  })
  searchTerm: string;

  @Column({
    type: "int",
    nullable: false,
  })
  radius: number;

  @ManyToOne(
    () => User,
    (user) => user.transactions,
    { eager: true, onDelete: "CASCADE" }
  )
  user: User;

}
