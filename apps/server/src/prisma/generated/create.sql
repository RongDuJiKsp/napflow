
[+] Added tables
  - users
  - user_groups
  - apps
  - app_publishs
  - app_datas

[*] Changed the `app_datas` table
  [+] Added foreign key on columns (ofAppId)
  [+] Added foreign key on columns (ofPublishVersion, ofAppId)

[*] Changed the `app_publishs` table
  [+] Added foreign key on columns (ofAppId)

[*] Changed the `user_groups` table
  [+] Added foreign key on columns (ofUser)
