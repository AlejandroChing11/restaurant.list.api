/**
 * Entidad que representa una transacción de búsqueda de restaurantes
 * Almacena los parámetros de búsqueda y la relación con el usuario que la realizó
 */
import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "transaction" })
export class Transaction {

  /**
   * Identificador único de la transacción (UUID)
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * Término de búsqueda usado para encontrar restaurantes
   * Puede ser una dirección, lugar o coordenadas
   */
  @Column({
    type: "text",
    nullable: false,
  })
  searchTerm: string;

  /**
   * Radio de búsqueda en metros
   * Define el área alrededor del punto central donde se buscarán restaurantes
   */
  @Column({
    type: "int",
    nullable: false,
  })
  radius: number;

  /**
   * Relación con el usuario que realizó la búsqueda
   * La opción eager carga automáticamente el usuario relacionado
   * onDelete CASCADE elimina las transacciones cuando se elimina el usuario
   */
  @ManyToOne(
    () => User,
    (user) => user.transactions,
    { eager: true, onDelete: "CASCADE" }
  )
  user: User;

}
