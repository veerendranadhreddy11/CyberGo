"""Compile the authored exercise sources into the static application catalog."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent.parent
for track in ('soc', 'pentest'):
    missions = []
    source = root / 'curriculum' / f'{track}.txt'
    for line in source.read_text().splitlines():
        if not line.strip() or line.startswith('#'):
            continue
        day = len(missions) + 1
        parts = line.split(' ~ ')
        if len(parts) != 8:
            raise ValueError(f'{track} day {day}: expected 8 fields, found {len(parts)}')
        title, skill, objective, raw_sample, pattern, task, expected, evidence = parts
        sample = raw_sample.replace('↵', '\n')
        matches = [row for row in sample.splitlines() if pattern in row]
        if not matches:
            raise ValueError(f'{track} day {day}: filter {pattern!r} returns zero rows')
        depends = re.fullmatch(r'(.*) \[(\d+)\]', skill)
        if depends:
            skill, previous = depends.group(1), int(depends.group(2))
            if not 0 < previous < day:
                raise ValueError(f'{track} day {day}: invalid prerequisite {previous}')
        else:
            previous = None
        phrase = 'Inspect the unfiltered rows beside the matches, then ' + task[0].lower() + task[1:]
        shell_literal = "'" + pattern.replace("'", "'\\''") + "'"
        m = dict(
            id=f'{track}-{day}', track=track, day=day, title=title, minutes=[30, 40, 50, 65][(day-1)//30],
            difficulty=['Foundation','Intermediate','Intermediate','Advanced'][(day-1)//30],
            platform='Kali, macOS, or Windows PowerShell' if track == 'pentest' else 'Windows PowerShell, Linux, or macOS',
            objective=objective, tools=['Text editor', 'grep or PowerShell Select-String'],
            setup='Download the supplied synthetic practice artifact as records.txt in a fresh folder. Open a terminal in that folder. grep is included on Kali/Linux and macOS. Select-String is included in Windows PowerShell. The exercise is offline.',
            steps=[
                'Open records.txt and read each line once. Preserve a clean copy of the raw evidence.',
                f'Run the command for your operating system to show lines containing “{pattern}” and include their line numbers.',
                phrase,
                'Save the requested evidence, citing row numbers and distinguishing observations from conclusions.'
            ],
            command=f'# Linux / macOS\ngrep -nF -- {shell_literal} records.txt\n\n# Windows PowerShell\nSelect-String -Path .\\records.txt -Pattern {repr(pattern)} -SimpleMatch',
            sample=sample,
            expected=f'The filter returns {len(matches)} matching ' + ('line. ' if len(matches)==1 else 'lines. ') + expected,
            troubleshoot=f'If there is no output, list the folder with ls or Get-ChildItem and confirm that the exact filename is records.txt. Preserve the original case and spacing of “{pattern}”. For the interpretation, check the raw rows near the highlighted entry.',
            evidence=evidence,
            checklist=[f'Located and checked the {pattern} evidence', task, evidence],
            skills=[skill]
        )
        if previous: m['previous'] = previous
        missions.append(m)
    if len(missions) != 120:
        raise ValueError(f'{track}: found {len(missions)} missions')
    overrides = json.loads((root / 'curriculum' / 'labs.json').read_text())
    for m in missions:
        if m['id'] in overrides:
            for field, value in overrides[m['id']].items():
                if value is None:
                    m.pop(field, None)
                else:
                    m[field] = value
    (root / 'curriculum' / f'{track}.json').write_text(json.dumps(missions, indent=2, ensure_ascii=False)+'\n')
