import type { RebuildLesson } from "./representative";

export const orientationLessons: RebuildLesson[] = [
  {
    id:"soc-rebuild/first-alert", track:"soc", level:"Absolute Beginner",
    module:"Introduction to SOC and Blue Team", title:"Follow an alert through the SOC",
    objectives:["Distinguish a recorded event, an alert, and an incident.", "Write a handoff that another analyst can verify."],
    preparation:"Complete the lessons about files and protecting a service. A log is a system’s record of an action. Practice with the three records below. No tools or accounts are required.",
    theory:[
      "A security operations center, or SOC, is a team that monitors systems and investigates reports. The Blue Team protects the organization. It can include SOC analysts, specialists who respond to incidents, and engineers who build the system’s security controls.",
      "An event is a recorded action, such as a sign-in attempt. An alert is a message that calls attention to one or more events. It can come from automatic rules or from a person. An incident is a security problem the organization has identified and must address. An alert is a starting point for investigation. Its existence alone does not establish what happened.",
      "Analysts triage an alert by deciding what to check and how urgently. They compare sources, note what each source can prove, and escalate unresolved high-impact concerns to the response owner. An analyst might check whether a failed login was followed by successful access. An engineer might improve a noisy alert after examining its history."
    ],
    terms:[["Triage","The first review that assigns a priority and a next step."],["Escalation","A handoff to someone equipped and authorized to respond."],["Evidence","Information another reviewer can use to verify a finding."]],
    flow:["Read the alert","Find the source event","Check other evidence","Write a handoff"],
    fixture:"09:10 E01 · Sign-in for sam failed.\n09:11 A01 · Rule flagged E01 as unusual.\n09:15 H01 · Help desk ticket confirms sam recently changed their password.",
    steps:["Copy the timestamps in order. Label each line by the source that produced it.", "Explain which record is an event and which is an alert about that event.", "Write one plausible benign explanation and one remaining question.", "Write a three-line handoff with record IDs, time range and a request for evidence of successful access."],
    expected:"E01 supports only a failed sign-in. A01 flags it. H01 supports a plausible explanation. None of these records establishes that another person signed in.",
    troubleshoot:"When a label says unusual, identify who assigned the label and what was observed. Report the underlying record separately from the alert’s interpretation.",
    independent:"An additional record at 09:16 reports a successful sign-in from an unfamiliar device. Revise the handoff. Explain which new fact justifies further review and one fact still needed before attributing the activity.",
    evidence:"Save the timeline, initial handoff and revised handoff. Reference the IDs and mark your hypothesis separately from your observations.",
    checklist:["I distinguished the event, alert and help desk record.", "I saved a revised handoff supported by evidence."],
    summary:"Start from the underlying events, test explanations with independent evidence, and hand off a clear next action.",
    encouragement:"Your handoff shows the next analyst what to verify next and which claims still need evidence.",
    questions:[
      {prompt:"Which line calls attention to an event?",choices:["H01","E01","A01","The timestamp"],correct:2,explanation:"A01 is a rule output referring to E01, the recorded action."},
      {prompt:"What can the original records demonstrate?",choices:["An unauthorized login succeeded","A failed login was flagged","The password was stolen","An unknown device enrolled"],correct:1,explanation:"The first two records describe a failure and an alert about that failure. They cannot establish a successful login."},
      {prompt:"How should the successful sign-in change the handoff?",choices:["Discard the original observations","Declare a confirmed intrusion","Close the case based on H01","Add the new evidence and request device verification"],correct:3,explanation:"The additional record changes the priority. Device ownership and legitimacy still need verification."}
    ]
  },
  {
    id:"red-rebuild/security-properties", track:"pentest", level:"Absolute Beginner",
    module:"Introduction to Cybersecurity", title:"Identify what a security control protects",
    objectives:["Distinguish weaknesses, threats and risk.", "Predict the expected decision of a simple access control."],
    preparation:"Complete the first Red Team lesson on clients and servers. The fictional shop records below contain every fact you need. Do the exercise entirely in your notes.",
    theory:[
      "Cybersecurity protects people, information and systems. Confidentiality protects information from unauthorized viewing. Integrity protects it from unauthorized change. Availability keeps services usable. A control is a safeguard. The same control can affect several properties, so identify the one at issue from the observed behavior.",
      "A vulnerability is a weakness in a system or process. A threat is a potential cause of harm. Risk considers both the likelihood of harm and its impact. A locked staff register is a control. A missing lock is a weakness. Someone reading private details is a possible consequence. Establish these separately before choosing a priority.",
      "Authentication helps a system establish who is making a request. Authorization applies policy to decide what that person may do. A shop may correctly recognize a customer while mistakenly permitting that customer to see another person's receipt. Before assessing a control, write what a legitimate user should be allowed to do and what must be denied."
    ],
    terms:[["Security property","A quality a system is expected to protect, such as confidentiality."],["Policy","A rule stating what behavior the organization permits."],["Impact","The consequence if an unwanted event occurs."]],
    flow:["Identify the data","Read the policy","Predict access","Compare the saved result"],
    fixture:"POLICY · Customers read their own receipts. Staff verify totals. Neither may change issued receipts in the shop app.\nS01 · Customer A reads A’s receipt.\nS02 · Customer A reads B’s receipt.\nS03 · Staff verify a total.\nS04 · The receipt history page is unavailable.",
    steps:["Name one data asset and one service the shop needs.", "Make a three-row table for S01–S03 with the expected and observed decisions.", "Identify the policy conflict and the affected security property. Write an impact statement limited to the saved results.", "Explain what S04 shows and what time or scope evidence you would request to gauge the disruption."],
    expected:"S01 and S03 match policy. S02 shows a confidentiality problem under the stated policy. S04 is availability evidence and does not show that stored receipts were changed.",
    troubleshoot:"If you assume that staff can change a receipt, read the issued-receipt rule again. A person's role does not grant any action beyond the policy.",
    independent:"A later record shows that a customer changed the total on their own issued receipt. Name the property affected and write expected outcomes for legitimate viewing and unauthorized changes after the shop fixes the control.",
    evidence:"Save your access table, a bounded finding for S02, and two post-fix outcomes for the independent exercise.",
    checklist:["I compared each receipt action to the written policy.", "I distinguished viewing from editing and saved expected post-fix outcomes."],
    summary:"Read the policy first, identify the affected security property, and verify that a fix protects data while allowing intended access.",
    encouragement:"You can now explain why a successful request may violate policy and give the owner a precise way to verify a fix.",
    questions:[
      {prompt:"What property is directly affected by S02?",choices:["Integrity","Confidentiality","Availability","Performance"],correct:1,explanation:"One customer read another person's information against policy. The record describes disclosure rather than a change or outage."},
      {prompt:"What does authentication establish?",choices:["Which policy is best","Whether every request is allowed","Who the caller is","Whether the total is correct"],correct:2,explanation:"Authentication identifies the caller. Authorization applies the policy for the requested action and object."},
      {prompt:"What should a post-fix check include?",choices:["Allowed own-receipt viewing and denied edits","Only denied requests","Only a smaller receipt total","Only a check that the shop loads"],correct:0,explanation:"A focused check preserves valid use and verifies the intended security boundary."}
    ]
  }
];
