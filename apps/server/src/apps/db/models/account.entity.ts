import { UserRole } from '@shared/common/account/base'
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryColumn()
  email: string

  @Column()
  nickname: string

  @Column()
  password: string

  @OneToMany(() => UserGroupEntity, userGroup => userGroup.user, { cascade: true })
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

  @PrimaryColumn({ type: 'enum', enum: UserRole })
  groupType: UserRole

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => UserEntity, user => user.userGroup)
  @JoinColumn({ name: 'ofUser', referencedColumnName: 'email' })
  user: UserEntity
}
