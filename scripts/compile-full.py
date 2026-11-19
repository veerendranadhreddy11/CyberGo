"""Compile the authored, offline course text into its shared Rust and TypeScript catalog."""
import json
from pathlib import Path

catalog = []
for line in Path("curriculum/full-source.txt").read_text().splitlines():
    if not line:
        continue
    if line.startswith("# "):
        key, title, summary = line[2:].split("|")
        catalog.append({"id": key, "title": title, "summary": summary, "lessons": []})
        continue
    fields = line.split("|", maxsplit=11)
    key, title, explanation, example, exercise, expected, troubleshooting, question, answer, wrong1, wrong2 = fields[:11]
    choices = [answer, wrong1, wrong2]
    offset = len(catalog[-1]["lessons"]) % 3
    choices = choices[offset:] + choices[:offset]
    catalog[-1]["lessons"].append({
        "id": f'{catalog[-1]["id"]}/{key}', "title": title,
        "explanation": explanation, "example": example, "exercise": exercise,
        "expected": expected, "troubleshooting": troubleshooting,
        "question": {"prompt": question, "choices": choices, "correct": choices.index(answer), "explanation": f"{answer}. {example}"},
        "command": fields[11] if len(fields) > 11 else "",
    })
Path("curriculum/full.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
