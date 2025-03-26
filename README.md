# BingoGenerator Website
Found at [bingo.jonasjones.dev](https://bingo.jonasjones.dev/) and [bingogenerator.jonasjones.dev](https://bingogenerator.jonasjones.dev/)

## Online Multiplayer Roadmap
- shared Games
  - same board
  - tiles to bingo count (game-internal leaderboard for all players)

- cloud-saved templates
  - save/load bingo-templates
  - ability to make public/private

- perhaps ingame chat? (very much not a priority though)

- technical details
  - absolutely need warning before enabling online features (since there is no monitoring of any kind)
  - cloudflare DB with worker attached (online.bingo.jonasjones.dev)
  - on page tab to toggle offline/online mode. only offline bingos are saved to cookie
  - the only online data stored in cookies is login data (session key)
  - games, templates, etc. are only saved on DB
