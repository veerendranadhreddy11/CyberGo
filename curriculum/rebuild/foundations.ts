import type { RebuildLesson } from "./representative";

export const foundationLessons: RebuildLesson[] = [
  {
    id: "soc-rebuild/protect-a-service", track: "soc", level: "Absolute Beginner",
    module: "Introduction to Cybersecurity", title: "Protect a service people rely on",
    objectives: ["Distinguish threats, vulnerabilities, and risk.", "Use confidentiality, integrity, and availability to prioritize a response."],
    preparation: "First study how a file moves from storage to a process. A service is a system that helps users do something, such as submitting work. Use the school scenario below. It is fictional and requires no other software.",
    theory: [
      "Cybersecurity protects systems, data, and people from harm. A threat is something that could cause harm, such as an impostor or a power outage. A vulnerability is a weakness that could allow harm, such as a public folder intended for staff. Risk combines the possible harm and how likely it is under the conditions.",
      "Confidentiality means restricting disclosure to approved people. Integrity means keeping data accurate and protecting it from unauthorized change. Availability means keeping systems and data usable when needed. The same event can threaten more than one property. Decide which effects you can demonstrate before assigning priorities.",
      "A control changes risk. Limiting who can read a file protects confidentiality. Checking a changed grade against a signed source supports integrity. Redundant storage and a tested restore can improve availability. Controls can fail, so name a quick, safe check that tells you whether the control worked."
    ],
    terms: [["Asset", "Something worth protecting, such as a gradebook or a service."], ["Control", "A safeguard that reduces the chance or impact of harm."], ["Ransomware", "Malicious software that can block access to data or systems, often to demand payment."]],
    flow: ["Identify the asset", "Classify the observed harm", "Choose a response", "Verify authorized use still works"],
    fixture: "08:12 A · Gradebook readable by anyone with its link. No unexpected edits found.\n08:25 B · Grade total differs from a signed teacher record. Site remains reachable.\n08:40 C · Submission page times out for all 30 students during a deadline.",
    steps: ["Name one protected asset in each observation. Mark confidentiality, integrity, or availability as the main concern supported by the record.", "For A, name the weakness and one possible consequence. Write a separate sentence saying whether the record shows who actually read it.", "Suggest one reversible action for B, such as pausing publication while the owner verifies the grade. Preserve the existing values and timestamps.", "Write a verification step for each action. For C, include a real submission test in a practice account after restoration, rather than checking only that the page loads."],
    expected: "A demonstrates inappropriate disclosure potential, B an integrity discrepancy and C service unavailability. Record the potential exposure without claiming an observer read the gradebook.",
    troubleshoot: "If you assign integrity to A because sensitive data is involved, ask which property actually changed. The observed problem is that the wrong audience can read the information.",
    independent: "A recovery copy makes the submission page available but contains an older gradebook version. List one availability success and one integrity risk. Recommend how the service owner should verify current grades before publishing.",
    evidence: "Save a three-row classification, one risk statement, a verification step per observation and your recovery decision.",
    checklist: ["I classified the observations and separated possible harm from observed harm.", "I explained the recovery tradeoff and saved a verification plan."],
    summary: "Security decisions identify a protected asset, describe the evidence, and select a control with an observable verification step.",
    encouragement: "You’ve turned three different signs of trouble into specific protections and checks a service owner can act on.",
    questions: [
      { prompt: "What weakness does observation A identify?", choices: ["A damaged processor", "An uncontrolled read permission", "A confirmed grade change", "A failed restore"], correct: 1, explanation: "A public read permission creates an exposure. The record does not identify an unauthorized reader or an unauthorized edit." },
      { prompt: "Which security property is at issue in B?", choices: ["Availability", "Confidentiality", "Integrity", "Address routing"], correct: 2, explanation: "The mismatch with the signed teacher record raises a question about correctness and authorized changes." },
      { prompt: "What best verifies recovery in C?", choices: ["Restore an older copy and assume it is current", "Check that the logo loads", "Disable every account", "Submit and retrieve a practice item through the restored service"], correct: 3, explanation: "An end-to-end practice submission verifies the workflow users depended on, including storage and retrieval." }
    ]
  },
  {
    id: "red-rebuild/scope-first", track: "pentest", level: "Absolute Beginner",
    module: "Ethical Hacking and Red Team Fundamentals", title: "Decide what a security assessment permits",
    objectives: ["Explain ethical testing, penetration testing, and Red Team exercises.", "Decide whether a proposed action fits written scope and stop conditions."],
    preparation: "Review the lesson on clients, servers, and who owns a service. This exercise uses a mock scope letter. Record your decisions in the lesson and leave every named system untouched.",
    theory: [
      "A vulnerability is a weakness that may allow harm. Ethical security testing is work conducted with permission and a duty to limit harm. A penetration test assesses weaknesses within a defined boundary and reports evidence, impact and remediation. A Red Team exercise tests how an organization detects and responds to an agreed scenario. Its objectives, contacts, safety controls and stop conditions are planned in advance.",
      "Rules of engagement tell you what permission means in practice. Scope identifies the exact systems, dates, identities and methods that the owner has approved. Permission for one test system does not cover a live service with a similar name. Permission to review saved records also does not cover direct requests. When an important term is ambiguous, pause and get a written clarification.",
      "Responsible disclosure means reporting a concern through the authorized channel and minimizing exposure of sensitive details. Record enough evidence for the owner to verify findings. If private data appears unexpectedly, stop that activity, avoid copying it and contact the person named in the scope."
    ],
    terms: [["Scope", "The approved boundary for work, including the applicable assets, dates and methods."], ["Stop condition", "An event that requires pausing the exercise and contacting the assigned person."], ["Remediation", "A change that removes or reduces an identified weakness."]],
    flow: ["Read the approval", "Match asset and method", "Check time and stop rules", "Document or request clarification"],
    fixture: "APPROVED · Review saved training-catalog records on Tuesday 09:00–11:00 UTC. No direct requests.\nCONTACT · Training coordinator. Stop if personal information appears.\nP1 · Review the delivered training-catalog record at 10:00.\nP2 · Open the live catalog at 10:00 to repeat a check.\nP3 · Review a training-catalog export at 11:20.",
    steps: ["Copy the asset, activity, time window and contact into four lines of notes.", "Classify P1, P2 and P3 as permitted or requiring a scope change. Give one reason each.", "Assume an unexpected name and address appear during P1. Write a two-sentence stop notice without copying personal details.", "State one purpose that distinguishes a Red Team exercise from a vulnerability-focused assessment."],
    expected: "P1 matches the request. P2 changes the method and system, and P3 is outside the approved window. The unexpected personal information requires stopping and reporting it.",
    troubleshoot: "If you approve P2 because the live service has the same owner, compare both the asset and the approved method. Every scope constraint needs to be satisfied.",
    independent: "The coordinator approves an extension until 12:00 UTC but says nothing about methods. Reclassify P2 and P3. Preserve the original scope and attach the written time clarification to your decision record.",
    evidence: "Save the three decisions, their reasons, your stop notice and the revised decisions after the time extension.",
    checklist: ["I checked each proposed activity against the scope and stop condition.", "I documented exactly what the time extension changed."],
    summary: "An assessment starts with owner authorization. Apply each scope constraint and document changes before proceeding with a new action.",
    encouragement: "You caught two common scope mistakes and wrote a stop decision that protects both the learner and the owner.",
    questions: [
      { prompt: "Which proposal fits every original scope constraint?", choices: ["P2", "P3", "P1", "P1 and P3"], correct: 2, explanation: "P1 matches the named record, review method, and approved time. P2 changes method and P3 changes timing." },
      { prompt: "What does the time extension change?", choices: ["P3 may proceed under the new time window", "Direct requests are allowed", "The live service becomes an approved target", "The stop condition expires"], correct: 0, explanation: "The owner changed the time window only. The original asset, method, and stop rules still apply." },
      { prompt: "What should you do if a record contains unexpected personal information?", choices: ["Publish a screenshot", "Review other records to see whether it repeats", "Copy the address into the report", "Stop the activity and contact the designated coordinator"], correct: 3, explanation: "The written rules name both the event and the contact. A minimally necessary notice can omit the personal details." }
    ]
  }
];
