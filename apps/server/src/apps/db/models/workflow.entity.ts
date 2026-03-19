import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { DefaultNullColumn, NotNullColumn } from '../decorator/entity'
import type { Edge, Node } from '@shared/common/workflow/core'
import type { Var } from '@shared/common/workflow/component-node'
import type { WorkflowApp, WorkflowAppData } from '@shared/common/workflow/base'
@Entity('apps')
export class WorkflowAppEntity extends BaseEntity implements WorkflowApp {
  @PrimaryColumn({ generated: 'uuid' })
  appId: string

  @NotNullColumn()
  appName: string

  @NotNullColumn()
  appDescription: string

  @CreateDateColumn()
  createdAt: Date

  @NotNullColumn()
  createdBy: string

  @OneToMany(() => WorkflowAppDataEntity, data => data.ofApp)
  workflowAppDatas: WorkflowAppDataEntity[]
}

@Entity('app_datas')
export class WorkflowAppDataEntity extends BaseEntity implements WorkflowAppData {
  // meta area
  @PrimaryColumn()
  version: string

  @PrimaryColumn()
  ofAppId: string

  @DefaultNullColumn({ type: 'varchar' })
  publishDescription: string | null

  @DefaultNullColumn({ type: 'datetime' })
  publishAt: Date | null

  @DefaultNullColumn({ type: 'varchar' })
  publishBy: string | null

  @UpdateDateColumn()
  lastUpdateAt: Date

  @ManyToOne(() => WorkflowAppEntity, app => app.workflowAppDatas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ofAppId' })
  ofApp: WorkflowAppEntity

  // data area

  @DefaultNullColumn({ type: 'json' })
  nodes: Node[] | null

  @DefaultNullColumn({ type: 'json' })
  edges: Edge[] | null

  @DefaultNullColumn({ type: 'json' })
  envs: Var[] | null
}
