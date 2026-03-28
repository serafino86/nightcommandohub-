#!/usr/bin/env python3
"""
Mock GAS server per testare Lotteria NGC localmente.
Avvia con: python3 mock-gas-server.py
Poi apri smorfia-game-local.html nel browser.
"""
import json, random, http.server, urllib.parse

DRAW  = [7, 22, 45, 67, 88]
JOLLY = 3
WEEK  = "2026-W13"

NAMES = [
    "SERAFINO","BIG WILD ANIMAL","DARTH MAUL","SHADOW BLADE","IRON WOLF",
    "RED DRAGON","NIGHT HAWK","STORM RIDER","DARK PHOENIX","COBRA KAI",
    "THUNDER BOLT","VIPER STRIKE","GHOST RIDER","STEEL FIST","SILVER FOX",
    "BLACK MAMBA","FIRE STORM","ICE BREAKER","LONE WOLF","WAR EAGLE",
    "DEATH WISH","CRIMSON TIDE","SILENT HAWK","IRON MAIDEN","NIGHT FURY",
    "STONE COLD","DARK KNIGHT","BLOOD MOON","WAR MACHINE","FROST BITE",
    "NEON TIGER","JADE DRAGON","CYBER PUNK","RAVEN CLAW","VOID WALKER",
    "STAR CRUSHER","MOON SHADOW","BONE CRUSHER","LAVA STORM","ACID RAIN",
    "PHANTOM FORCE","TOXIC WASTE","STEEL RAIN","DARK MATTER","SOLAR FLARE",
    "NOVA BURST","QUASAR","PULSAR","NEBULA","SUPERNOVA",
]

random.seed(42)

def count_matches(picks, jolly_pick):
    matches = len(set(picks) & set(DRAW))
    jolly_matched = (jolly_pick == JOLLY)
    return matches, jolly_matched

def gen_picks_with_bias(n_forced):
    """Genera picks includendo n_forced numeri dall'estrazione (per rendere la classifica realistica)."""
    forced = random.sample(DRAW, n_forced)
    remaining = random.sample([n for n in range(1,91) if n not in forced and n not in DRAW], 5 - n_forced)
    nums = forced + remaining
    random.shuffle(nums)
    jolly_pool = [n for n in range(1,91) if n not in nums]
    jolly = JOLLY if random.random() < 0.15 else random.choice(jolly_pool)
    dice_total = random.randint(1,6) + random.randint(1,6) + random.randint(1,6)
    return nums, jolly, dice_total

# Distribuzione realistica: 1 vincitore con 4, qualcuno con 3, molti con 1-2, tanti con 0
BIAS = (
    [4] * 1 +   # 1 giocatore con 4 indovinati
    [3] * 3 +   # 3 giocatori con 3 indovinati
    [2] * 10 +  # 10 giocatori con 2 indovinati
    [1] * 20 +  # 20 giocatori con 1 indovinato
    [0] * 16    # 16 giocatori con 0
)
random.shuffle(BIAS)

ALL_ENTRIES = []
for name, bias in zip(NAMES, BIAS):
    nums, jolly, dice_total = gen_picks_with_bias(bias)
    m, jm = count_matches(nums, jolly)
    ALL_ENTRIES.append({
        "playerName": name,
        "numbers": nums,
        "jolly": jolly,
        "diceTotal": dice_total,
        "matches": m,
        "jollyMatched": jm,
        "weekId": WEEK,
    })

# Sort: matches desc, jolly desc, diceTotal desc, name asc
ALL_ENTRIES.sort(key=lambda e: (-e["matches"], -int(e["jollyMatched"]), -e["diceTotal"], e["playerName"]))
for i, e in enumerate(ALL_ENTRIES):
    e["rank"] = i + 1

HALL_OF_SHAME = [
    {"weekId":"2026-W12","winnerName":"BIG WILD ANIMAL","matches":4,"jollyMatched":True,
     "numbers":[3,15,27,42,88],"jolly":7,"drawnNumbers":[3,15,27,42,50],"drawnJolly":7},
    {"weekId":"2026-W11","winnerName":"DARTH MAUL","matches":3,"jollyMatched":False,
     "numbers":[1,8,13,33,72],"jolly":5,"drawnNumbers":[1,8,13,20,30],"drawnJolly":99},
    {"weekId":"2026-W10","winnerName":"SERAFINO","matches":5,"jollyMatched":True,
     "numbers":[4,11,19,55,82],"jolly":17,"drawnNumbers":[4,11,19,55,82],"drawnJolly":17},
]

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"  {self.command} {self.path[:80]}")

    def send_json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type","application/json")
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers","*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers","*")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        action = qs.get("action",[""])[0]
        player = qs.get("playerName",[""])[0].upper()

        if action == "getWeeklyDraw":
            self.send_json({"status":"success","data":{
                "weekId":WEEK,"numbers":DRAW,"jolly":JOLLY,"timestamp":"2026-03-28T09:00:00Z"
            }})

        elif action == "getSmorfiaLeaderboard":
            self.send_json({"status":"success","data":{
                "weekId":WEEK,"drawn":True,"drawnNumbers":DRAW,"drawnJolly":JOLLY,
                "entries":ALL_ENTRIES
            }})

        elif action == "getMySmorfiapicks":
            entry = next((e for e in ALL_ENTRIES if e["playerName"]==player), None)
            if entry:
                self.send_json({"status":"success","data":{
                    "playerName":player,"numbers":entry["numbers"],
                    "jolly":entry["jolly"],"weekId":WEEK,"timestamp":"2026-03-28T08:00:00Z"
                }})
            else:
                self.send_json({"status":"success","data":None})

        elif action == "getSmorfiaHallOfShame":
            self.send_json({"status":"success","data":HALL_OF_SHAME})

        else:
            self.send_json({"status":"error","data":"Unknown action"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length",0))
        body = json.loads(self.rfile.read(length) or b'{}')
        action = body.get("action","")
        if action == "saveSmorfiapicks":
            self.send_json({"status":"success","data":{
                "message":"Saved","weekId":WEEK,
                "playerName":body.get("playerName","").upper(),
                "numbers":body.get("numbers",[]),
                "jolly":body.get("jolly",0)
            }})
        else:
            self.send_json({"status":"error","data":"Unknown action"})

if __name__ == "__main__":
    PORT = 8765
    winner = ALL_ENTRIES[0]
    print(f"Mock GAS server su http://localhost:{PORT}")
    print(f"  Estrazione: {DRAW} + Jolly {JOLLY}  (settimana {WEEK})")
    print(f"  Vincitore simulato: {winner['playerName']} — {winner['matches']} match, jolly={winner['jollyMatched']}")
    print(f"  50 giocatori generati, classifica pronta")
    print(f"  Apri smorfia-game-local.html nel browser")
    print(f"  Premi Ctrl+C per fermare\n")
    http.server.HTTPServer(("", PORT), Handler).serve_forever()
