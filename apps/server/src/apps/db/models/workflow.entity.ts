import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm'
import { NotNullColumn } from '../decorator/entity'
import type { JsonObject } from 'type-fest'
@Entity('apps')
export class WorkflowAppEntity extends BaseEntity {
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

  @OneToMany(() => WorkflowAppPublishEntity, publish => publish.ofApp)
  workflowAppPublishs: WorkflowAppPublishEntity[]

  @OneToMany(() => WorkflowAppDataEntity, data => data.ofApp)
  workflowAppDatas: WorkflowAppDataEntity[]
}

@Entity('app_publishs')
export class WorkflowAppPublishEntity extends BaseEntity {
  @PrimaryColumn()
  version: string

  @PrimaryColumn()
  ofAppId: string

  @Column({ type: 'text' })
  description: string | null

  @CreateDateColumn()
  publishAt: Date

  @Column({ type: 'text' })
  publishBy: string | null

  @ManyToOne(() => WorkflowAppEntity, app => app.workflowAppPublishs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ofAppId' })
  ofApp: WorkflowAppEntity

  @ManyToOne(() => WorkflowAppDataEntity, data => data.ofPublish, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'ofPublishVersion', referencedColumnName: 'ofPublishVersion' },
    { name: 'ofAppId', referencedColumnName: 'ofAppId' },
  ])
  ofData: WorkflowAppDataEntity | null
}

@Entity('app_datas')
@Unique(['ofPublishVersion', 'ofAppId'])
export class WorkflowAppDataEntity extends BaseEntity {
  @PrimaryColumn({ generated: 'uuid' })
  dataId: string

  @NotNullColumn()
  ofAppId: string

  @ManyToOne(() => WorkflowAppEntity, app => app.workflowAppDatas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ofAppId' })
  ofApp: WorkflowAppEntity

  @NotNullColumn()
  ofPublishVersion: string

  @ManyToOne(() => WorkflowAppPublishEntity, publish => publish.ofData, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'ofPublishVersion', referencedColumnName: 'version' },
    { name: 'ofAppId', referencedColumnName: 'ofAppId' },
  ])
  ofPublish: WorkflowAppPublishEntity

  @Column({ type: 'json' })
  nodes: JsonObject[] | null

  @Column({ type: 'json' })
  edges: JsonObject[] | null
}
