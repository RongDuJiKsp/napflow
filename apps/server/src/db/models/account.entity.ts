import { UserRole } from '@shared/data-transfer/account/base'
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryColumn()
  email: string

  @Column()
  nickname: string

  @Column()
  password: string

  @OneToMany(() => UserGroupEntity, userGroup => userGroup.user)
  userGroup: UserGroupEntity[]

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
  @Column({ type: 'enum', enum: UserRole })
  groupType: UserRole

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => UserEntity, user => user.userGroup)
  user: UserEntity
}
