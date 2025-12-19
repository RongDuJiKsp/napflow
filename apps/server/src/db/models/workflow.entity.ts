import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm'

@Entity('apps')
export class WorkflowAppEntity extends BaseEntity {
  @PrimaryColumn({ generated: 'uuid' })
  appId: string

  @Column()
  appName: string

  @Column()
  appDescription: string

  @CreateDateColumn()
  createdAt: Date

  @Column()
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

  @Column({ type: 'text', nullable: true })
  description: string | null

  @CreateDateColumn()
  publishAt: Date

  @Column({ type: 'text', nullable: true })
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

  @Column()
  ofAppId: string

  @ManyToOne(() => WorkflowAppEntity, app => app.workflowAppDatas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ofAppId' })
  ofApp: WorkflowAppEntity

  @Column()
  ofPublishVersion: string

  @ManyToOne(() => WorkflowAppPublishEntity, publish => publish.ofData, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'ofPublishVersion', referencedColumnName: 'version' },
    { name: 'ofAppId', referencedColumnName: 'ofAppId' },
  ])
  ofPublish: WorkflowAppPublishEntity

  @Column({ type: 'json', nullable: true })
  nodes: object[] | null

  @Column({ type: 'json', nullable: true })
  edges: object[] | null
}
