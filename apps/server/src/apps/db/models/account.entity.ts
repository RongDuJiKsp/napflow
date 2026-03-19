import { UserRole } from '@shared/common/account/core'
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { NotNullColumn } from '../decorator/entity'
import type { User, UserGroup } from '@shared/common/account/entity'

@Entity('users')
export class UserEntity extends BaseEntity implements User {
  @PrimaryColumn()
  email: string

  @NotNullColumn()
  nickname: string

  @NotNullColumn()
  password: string

  @OneToMany(() => UserGroupEntity, userGroup => userGroup.user, {
    cascade: true,
  })
  userGroup: UserGroupEntity[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  disabledAt: Date | null
}

@Entity('user_groups')
export class UserGroupEntity extends BaseEntity implements UserGroup {
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
