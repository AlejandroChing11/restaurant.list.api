/**
 * Entidad que representa a un usuario en el sistema
 * Almacena sus datos personales, credenciales y relación con sus transacciones
 */
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  /**
   * Identificador único del usuario (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nombre completo del usuario
   */
  @Column('text')
  name: string;

  /**
   * Correo electrónico del usuario (debe ser único)
   */
  @Column('text', {
    unique: true,
  })
  email: string;

  /**
   * Contraseña del usuario (almacenada con hash)
   * No se incluye en las consultas por defecto
   */
  @Column('text', {
    select: false,
  })
  password: string;

  /**
   * Indica si el usuario está activo en el sistema
   * Se usa para controlar el estado de login/logout
   */
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  /**
   * Roles asignados al usuario para control de acceso
   */
  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  /**
   * Relación con las transacciones realizadas por el usuario
   */
  @OneToMany(
    () => Transaction,
    transaction => transaction.user,
  )
  transactions: Transaction[];
}
