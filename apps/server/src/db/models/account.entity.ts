import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

export enum UserGroupTypes {
  Admin = 'Admin',
  User = 'User',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryColumn()
  email: string

  @Column()
  nickname: string

  @Column()
  password: string

  @OneToMany(() => UserGroupEntity, userGroup => userGroup.user)
  userGroups: UserGroupEntity[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  disabledAt: Date | null
}

@Entity('user_groups')
export class UserGroupEntity extends BaseEntity {
  @PrimaryColumn()
  ofUser: string

  @PrimaryColumn()
  @Column({ type: 'enum', enum: UserGroupTypes })
  groupType: UserGroupTypes

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => UserEntity, user => user.userGroups)
  user: UserEntity
}
