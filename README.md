todo:
- traps
- monster rooms
- monster special attacks
- does see invisible still work?
- bank on dungeon level 5
- spells:  sph, alt
- buildings
  - LRS
  - Home
  - Thrift Shop
  - College
- view inventory
- make sure difficulty > 0 is fully implemented
- winning
- create random levels

bugs:
- store
- bank
- store: a chest +6
- altars are badly broken
- monsters move before missile spells are complete
- monsters don't advance after range attacks (probably due to 2x monster move "fix")


rename:
- player.level.items[][] -> item
- player.level.monsters[][] -> monster
- player.level.know -> know
- getItem(x,y) -> itemAt(x,y)
