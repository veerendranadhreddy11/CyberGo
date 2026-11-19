"""Build study and assessment overlays without changing mission IDs or checklists."""
import json
import re
from pathlib import Path

root = Path("curriculum")
topics = json.loads((root / "teaching-topics.json").read_text())
full = json.loads((root / "full.json").read_text())
mission_content = {}
full_content = {}
answers = {}


def choose(prompt, correct, distractors, explanation, seed):
    options = [correct, *distractors]
    assert len(set(options)) == 4, prompt
    offset = seed % 4
    options = options[offset:] + options[:offset]
    return dict(prompt=prompt, choices=options, correct=options.index(correct), explanation=explanation)


encouragement = [
    "Good work slowing down to check what the source actually shows.",
    "The care you took here makes the next practice task easier to reason through.",
    "A small, reproducible observation is a strong result.",
    "You have another example you can revisit when the concept feels unfamiliar.",
    "Keeping the original record and your interpretation separate is a skill worth keeping.",
    "Your evidence gives you something concrete to compare with later exercises.",
    "You made room for uncertainty and still reached a useful result.",
    "Notice which part of the exercise felt clearer after you checked the example.",
    "Finishing with evidence gives future you a useful starting point.",
    "The record you made is more useful than relying on memory alone.",
    "Keep asking how you know. Your answer to this lesson is a good place to begin.",
    "A careful comparison now will help you spot less obvious differences later.",
    "Review your result once more before moving on if you want the idea to stick.",
    "You turned a technical observation into a result another learner could review.",
    "Take a moment to recognize the work you put into checking the conclusion.",
    "Your practice shows how a precise question can make a complex problem manageable.",
    "You can now use this example as a reference for the next unfamiliar record.",
    "This exercise gave you a repeatable way to make sense of evidence.",
    "Steady practice is how these checks become familiar.",
    "You captured a result you can compare with a different example tomorrow or today.",
]

for track in ("soc", "pentest"):
    data = json.loads((root / f"{track}.json").read_text())
    rows = [line.split(" ~ ") for line in (root / f"{track}.txt").read_text().splitlines() if line.strip() and not line.startswith("#")]
    assert len(rows) == len(data)
    for index, (mission, row) in enumerate(zip(data, rows)):
        title, skill, objective, sample, pivot, analysis, expected, evidence = row
        assert title == mission["title"]
        category = re.sub(r" \[\d+\]$", "", skill)
        theory, example, relevance = topics[category]
        if index == 0 and track == "soc":
            theory = "Cybersecurity protects the confidentiality, integrity, and availability of systems and data. A Security Operations Center (SOC) is the team and process for monitoring security events, investigating alerts, and coordinating response. Analysts compare observations across sources, preserve evidence, and escalate findings under agreed procedures. Start here by learning how an operating system records account activity."
        if index == 0 and track == "pentest":
            theory = "Ethical hacking is security assessment under explicit permission and agreed limits. A penetration test evaluates particular weaknesses within that scope. Red Team work evaluates broader defensive readiness under a documented exercise plan. Written authorization, isolation, and a stop condition come before practical work. In this mission you inspect a saved service inventory and learn what its fields can support."
        seed = index + (120 if track == "pentest" else 0)
        distractors = [rows[(index+n)%120] for n in (1,2,3)]
        questions = [
            choose(f"Which interpretation matches the evidence in {title}?", expected,
                   [r[6] for r in distractors], f"The lesson ties the given artifact to this conclusion: {expected}", seed),
            choose(f"Which observation is the focus of the practice data for {title}?", pivot,
                   [f"An external reputation score for {pivot}", f"A host inventory collected after {pivot}", f"A network-wide count inferred from {pivot}"], f"Begin with the literal pivot ‘{pivot}’ in the bundled observation. Check adjacent context before drawing a conclusion.", seed+1),
            choose(f"What should you preserve to make {title} reproducible?", evidence,
                   [r[7] for r in distractors], f"The stated evidence requirement is: {evidence}", seed+2),
            choose(f"What analysis connects the example to the goal in {title}?", analysis,
                   [r[5] for r in distractors], f"This action works with the fields and scope shown in this mission. {expected}", seed+3),
            choose(f"Which outcome belongs in your learning notes after {title}?", objective,
                   [r[2] for r in distractors], f"The lesson goal determines what your notes should demonstrate: {objective}", seed+4),
        ]
        motivation = f"{encouragement[(seed * 7 + index // 20) % len(encouragement)]} You documented the result of {title}."
        if index == 0 and track == "soc":
            motivation = "Your SOC journey has begun. Reading your first audit records is a practical step toward understanding how security teams protect systems."
        if index == 0 and track == "pentest":
            motivation = "You started with a responsible assessment habit: checking the lab boundary before drawing conclusions from a service inventory."
        item = dict(theory=theory, example=example, relevance=relevance, pivot=pivot,
                    analysis=analysis, motivation=motivation, questions=questions)
        mission_content[mission["id"]] = item
        answers[mission["id"]] = [[q["correct"], len(q["choices"])] for q in questions]

for module in full:
    for index, lesson in enumerate(module["lessons"]):
        title, base = lesson["title"], lesson["question"]
        question = dict(base, choices=[*base["choices"], "A conclusion based only on the lesson heading"])
        siblings = [item for item in module["lessons"] if item != lesson][:3]
        additional=[]
        for position, (field, prompt) in enumerate([
            ("example", "Which scenario illustrates"),
            ("exercise", "Which practical task applies"),
            ("expected", "Which outcome verifies"),
            ("troubleshooting", "Which troubleshooting step fits"),
        ], start=1):
            additional.append(choose(f"{prompt} {title}?", lesson[field], [item[field] for item in siblings], lesson[field], index+position))
        full_content[lesson["id"]] = [question, *additional]
        answers[lesson["id"]] = [[q["correct"],len(q["choices"])] for q in [question,*additional]]

for name, payload in [("mission-teaching.json",mission_content),("full-checks.json",full_content),("course-answers.json",answers)]:
    (root / name).write_text(json.dumps(payload, ensure_ascii=False, separators=(",",":")) + "\n")
