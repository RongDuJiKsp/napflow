
[+] Added tables
  - users
  - user_groups
  - apps
  - WorkflowAppPublish
  - app_datas

[*] Changed the `WorkflowAppPublish` table
  [+] Added foreign key on columns (ofAppId)

[*] Changed the `app_datas` table
  [+] Added foreign key on columns (ofAppId)
  [+] Added foreign key on columns (ofPublishVersion, ofAppId)

[*] Changed the `user_groups` table
  [+] Added foreign key on columns (ofUser)
