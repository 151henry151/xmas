# xmas

Top-down NYC Christmas tree vendor game — play at **[hromp.com/xmas](https://hromp.com/xmas/)**.

You are a tree seller working lots across Manhattan (simplified map). Walk with **WASD** or **arrow keys**, press **E** at a stand to start Pokémon-style sales dialogues. Win battles by persuading customers to buy. Compete and chat with other vendors at rival stands. After **three good seasons** (5+ tree sales each), unlock **Romp Family Christmas Trees** at Jane Street & 8th Avenue — the prestige “final boss” lot.

## Features

- Account login (username + password, JWT sessions)
- Multiplayer: see other players walking the city in real time
- Multiple tree stands (Times Square, Union Square, Columbus Circle, Brooklyn Bridge, Grand Central, Washington Square, Romp Family)
- Seller characters: Rookie, Hustler, Charmer, Expert
- Customer types with branching dialog choices
- Vendor NPC encounters at other stands
- Season progression and Romp Family unlock

## Run locally

```bash
npm install
npm start
# http://localhost:3334
```

## Tests

```bash
npm test
```

## Production (hromp.com)

Proxy **`/xmas/`** to Node (default port **17335**). See **`my-webserver-setup`**: `scripts/xmas.service`, `nginx/conf.d/00-hromp.com.conf`.

```bash
npm install
# systemd: xmas.service, systemctl enable --now xmas
```

Set **`XMAS_JWT_SECRET`** in production.

## License

GPL-3.0
