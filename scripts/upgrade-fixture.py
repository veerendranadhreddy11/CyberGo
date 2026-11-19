"""Seed and verify synthetic learning data across an installed v1 to v2 upgrade."""
import argparse
import json
from pathlib import Path
import sqlite3

parser = argparse.ArgumentParser()
parser.add_argument("operation", choices=["seed", "verify"])
parser.add_argument("database", type=Path)
args = parser.parse_args()
payload = {"checks": [0], "notes": "Upgrade smoke test note", "minutes": 17}
pentest = {"checks": [0], "notes": "Second learning path", "minutes": 21}
evidence_id = "f2ce6479-6d58-499c-af55-afdb256fc900"
with sqlite3.connect(args.database) as db:
    version = db.execute("PRAGMA user_version").fetchone()[0]
    if args.operation == "seed":
        assert version == 1
        db.execute('UPDATE settings SET start_day=?, display_preferences=? WHERE id=1', ('2026-01-02', '{"reduceMotion":true}'))
        db.execute("INSERT INTO mission_progress VALUES (?,?)", ('soc-1', json.dumps(payload)))
        db.execute("INSERT INTO mission_progress VALUES (?,?)", ('pentest-1', json.dumps(pentest)))
        db.execute("INSERT INTO evidence VALUES (?,?,?)", (evidence_id, 'soc-1', 'upgrade.txt'))
        (args.database.parent/'evidence'/evidence_id).write_bytes(b'Synthetic upgrade evidence')
    else:
        assert version == 2
        date, prefs = db.execute('SELECT start_day,display_preferences FROM settings WHERE id=1').fetchone()
        assert date == '2026-01-02' and json.loads(prefs) == {'reduceMotion': True}
        assert json.loads(db.execute("SELECT record_json FROM mission_progress WHERE mission_id='soc-1'").fetchone()[0]) == payload
        assert json.loads(db.execute("SELECT record_json FROM mission_progress WHERE mission_id='pentest-1'").fetchone()[0]) == pentest
        assert db.execute("SELECT name FROM evidence WHERE id=?", (evidence_id,)).fetchone()[0] == 'upgrade.txt'
        assert (args.database.parent/'evidence'/evidence_id).read_bytes() == b'Synthetic upgrade evidence'
        assert json.loads(db.execute("SELECT record_json FROM full_course_state WHERE id=1").fetchone()[0]) == {'records': {}, 'badges': {}}
        print('Verified prior date, notes, checklist, minutes, preference and evidence after installation.')
