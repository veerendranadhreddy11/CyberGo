import type { Question } from "../../lib/teaching";

export type RebuildLesson = {
  id: string;
  track: "soc" | "pentest";
  level: "Absolute Beginner" | "Foundation" | "Intermediate" | "Advanced";
  module: string;
  title: string;
  objectives: string[];
  preparation: string;
  theory: string[];
  terms: [string, string][];
  flow: string[];
  fixture: string;
  steps: string[];
  expected: string;
  troubleshoot: string;
  independent: string;
  evidence: string;
  checklist: [string, string];
  summary: string;
  encouragement: string;
  questions: Question[];
};

export const representativeLessons: RebuildLesson[] = [
  {
    id: "soc-rebuild/computer-first",
    track: "soc", level: "Absolute Beginner", module: "Introduction to Computers",
    title: "What happens when you open a file?",
    objectives: ["Distinguish hardware from software, and working memory from durable storage.", "Explain which parts of a computer are involved when a SOC analyst opens a log."],
    preparation: "No previous computer or cybersecurity knowledge is required. Read the records below inside CyberNex. The timestamp uses UTC, a common reference time that makes records from different locations comparable.",
    theory: [
      "A computer takes input, follows instructions and produces output. The keyboard is a physical input device. Hardware is the physical equipment, while software is the instructions and data it uses. The central processing unit (CPU) runs instructions. Random-access memory (RAM) is fast working space for running programs. A solid-state drive (SSD) keeps saved files after shutdown.",
      "An operating system, such as Windows, macOS or Linux, manages hardware and decides which programs can access files and devices. An application is a program for a task. A process is one running instance of a program. Opening one document usually asks a process to read bytes from storage. Closing it releases the working copy in memory. An unsaved edit can disappear because it only existed in memory.",
      "A path identifies a location inside folders. In a security investigation, keeping the path helps another analyst identify the same file. A security operations center (SOC) is a team that monitors systems and investigates signs of trouble. A log is a record made by a system. Opening a log to read it and changing the original log are different actions with different effects on evidence."
    ],
    terms: [["Byte", "A small unit of stored information."], ["Path", "The location of a file through its containing folders."], ["Read-only", "A mode for viewing data without writing changes to it."]],
    flow: ["File on SSD", "Operating system checks access", "Process uses RAM and CPU", "Text appears on screen"],
    fixture: "2026-10-01T09:14:00Z  workstation-7  notes-viewer  OPEN  /training/alert.txt\n2026-10-01T09:14:32Z  workstation-7  notes-viewer  CLOSE /training/alert.txt",
    steps: ["Read the first line left to right. Copy the time, computer name, program name and file path into your notes.", "Compare OPEN with CLOSE. Explain which action begins reading a file and which ends the program’s access to the document.", "Draw four boxes for storage, operating system, process and display. Follow the file from the first box to the last, and put RAM next to the running process.", "Write one sentence explaining what would happen to an unsaved note if the machine lost power."],
    expected: "Your note identifies workstation-7 and /training/alert.txt. The saved file remains on the SSD when the program closes. Neither record establishes that someone edited the original.",
    troubleshoot: "If you confuse the machine and program names, read the same column in both lines. The last column is the path. A path starting with a slash is formatted like a Linux or macOS path. Windows commonly uses a drive letter.",
    independent: "A later record says SAVE /training/summary.txt on the same workstation. Which file would you ask another analyst to inspect to verify the saved summary? Explain why the original alert still matters.",
    evidence: "Save your four-field reading and one sentence separating memory from storage. Include the path you chose for the independent exercise.",
    checklist: ["I traced the original alert from storage to the display.", "I saved my interpretation of the new SAVE record."],
    summary: "Storage holds the saved file, RAM supports the running program, and the operating system mediates access. The log records an action with a time, machine and path.",
    encouragement: "You’ve read a computer activity record and explained where the evidence lives. That is a useful first step in an investigation.",
    questions: [
      {prompt:"Where does a saved log normally persist through shutdown?",choices:["CPU","SSD","RAM","Keyboard"],correct:1,explanation:"The SSD is durable storage. RAM is working memory and normally loses its contents when power is removed."},
      {prompt:"What is notes-viewer while it is running?",choices:["A physical input device","A file path","A process","A timestamp"],correct:2,explanation:"A running instance of an application is a process."},
      {prompt:"What can you justify from the two records?",choices:["The original was edited","The file was opened and closed","The computer was stolen","The file was deleted"],correct:1,explanation:"OPEN and CLOSE describe access. Additional records would be needed to support a claim about modification."}
    ]
  },
  {
    id: "red-rebuild/computer-first",
    track: "pentest", level: "Absolute Beginner", module: "Introduction to Computers",
    title: "How a computer shows a web page",
    objectives: ["Explain hardware, software, processes, files and operating systems from a browser example.", "Distinguish the computer that requests a page from the computer that serves it."],
    preparation: "Start with the drawing and the two printed records. You need CyberNex only. There is no site to visit and no network traffic to generate.",
    theory: [
      "A computer transforms input into output by following instructions. Clicking an icon sends input. The CPU executes instructions, RAM keeps temporary working data, and an SSD keeps saved files. The operating system manages these parts and controls access to devices and files. Software includes the operating system and applications built to perform tasks.",
      "A browser is an application. When it runs, the operating system assigns memory and creates one or more processes. A process is an active instance or component of a running program. Files are named data, and folders group files. A page displayed by a browser can come from a file on the same machine or from another computer.",
      "When the page comes from another computer, the browser is the client. It asks a server to return information using an agreed format called a protocol. HTTP is one such format. HTTPS uses a protected connection to carry HTTP. A security tester must know who owns each side and what the owner has authorized. Seeing a page does not give permission to test its underlying systems."
    ],
    terms: [["Client", "A program that requests a service."], ["Server", "A program or computer that responds with a service."], ["HTTP response", "A structured answer containing a status and sometimes page data."]],
    flow: ["Learner and browser process", "Page request", "Server reads saved content", "Response shown in browser"],
    fixture: "client role=browser action=REQUEST path=/catalog\nserver role=publisher action=REPLY path=/catalog status=200",
    steps: ["Underline the requesting role and circle the replying role in your notes.", "Match the path in both lines. Write how that match helps you follow the requested item.", "Describe what the browser uses RAM for and where the publisher could keep the saved page.", "Add one sentence stating who would need to approve any later security testing."],
    expected: "The browser asks for /catalog and the publisher replies. Status 200 means the server processed this request successfully. The logs alone say nothing about whether other paths exist or are in scope.",
    troubleshoot: "If you read 200 as a network port, look for the label status. This number describes the result of an HTTP message. If both programs run on one computer, client and server still describe different roles.",
    independent: "A new server response says status=404 for /training. The lesson defines 404 as the server reporting that it could not find the requested item. Explain what changed and what you still cannot conclude about permissions.",
    evidence: "Keep the annotated roles, a browser memory example and a two-sentence explanation of the independent response.",
    checklist: ["I explained the request and reply using client and server roles.", "I saved what the 404 record can and cannot establish."],
    summary: "A browser process and a server have distinct roles. Files, working memory and an operating system support both. Test scope comes from authorization.",
    encouragement: "You can now explain a page load from click to reply and identify where a tester needs permission.",
    questions: [
      {prompt:"Which role asked for /catalog?",choices:["Publisher","SSD","Browser client","Operating system kernel"],correct:2,explanation:"The client sends the request. The publisher's server responds to it."},
      {prompt:"Which resource is normally temporary working space?",choices:["SSD","RAM","Saved file","Network address"],correct:1,explanation:"Programs use RAM as fast working space. Saved files persist on durable storage."},
      {prompt:"Who can authorize tests of the publisher's server?",choices:["Any visitor","The browser vendor","The person reading the status","The owner or their authorized delegate"],correct:3,explanation:"Website access and an HTTP result do not grant security testing permission."}
    ]
  },
  {
    id: "soc-rebuild/login-triage",
    track: "soc", level: "Intermediate", module: "Security Logs",
    title: "Triage a cluster of authentication events",
    objectives:["Normalize a sign-in sequence and separate observations from hypotheses.", "Choose an escalation based on time, identity and corroboration."],
    preparation:"Refresh networking and logs first. An IP address identifies a network endpoint at a moment in time. A sign-in ties a claimed account to an authentication result. An MFA prompt asks for another factor besides a password. All records below are synthetic, UTC and included offline.",
    theory:[
      "Triage is the first evaluation of a signal to decide what to examine and how quickly to act. A failed sign-in can be a typo. Repeated failures across accounts suggest a pattern worth investigating. A successful result shortly after failures on the same account raises priority, especially when a second system records an unfamiliar device.",
      "Group evidence by account, source address, target service and a stated time window. A repeated source may belong to a VPN or shared gateway. A new device signal depends on registration history and can fire when a legitimate worker replaces a laptop. Explain what each source actually measured before combining them.",
      "Make an escalation easy to check. Include time bounds, the exact accounts, event IDs and unresolved questions. Corroborate with approved endpoint and identity records. Coordinate containment with the identity owner when evidence justifies action."
    ],
    terms:[["Correlation","Relating records through shared facts such as account and timestamp."],["False positive","A signal whose apparent security concern is explained by legitimate activity."],["MFA","A check involving more than one type of proof of identity."]],
    flow:["Normalize UTC", "Group by source and account", "Compare independent telemetry", "Escalate with uncertainty"],
    fixture:"09:12:00Z A01 auth failure account=mira src=192.0.2.8\n09:12:30Z A02 auth failure account=eli  src=192.0.2.8\n09:13:10Z A03 auth success account=eli  src=192.0.2.8\n09:14:00Z D01 device new   account=eli  id=L-17\n09:18:21Z A04 auth failure account=jo   src=192.0.2.71",
    steps:["Create a timeline with UTC, ID, account, outcome and source. Leave source blank for D01 because it is not reported.", "Circle the records sharing 192.0.2.8 and write that A02 and A03 identify the same account.", "Add D01 separately as a second signal for eli. State the check that could establish whether L-17 was legitimately enrolled.", "Draft a short escalation with the UTC window, evidence IDs, priority and the next responder action."],
    expected:"A01–A03 form a 70-second cluster. A02 and A03 share eli and a source; D01 refers to eli without an IP. Request device enrollment and MFA details before attributing the sign-in or declaring compromise.",
    troubleshoot:"Keep the account and device columns separate. If IP geolocation or network ownership is absent, mark it unknown. A04 shares neither the source nor accounts and is outside the tight cluster.",
    independent:"The device owner later confirms L-17 is approved but cannot explain A01. Revise the escalation. Preserve the auth cluster as an open question and remove the unsupported claim that the device is unauthorized.",
    evidence:"Keep the timeline, evidence IDs, initial and revised sentences, and one specific verification request.",
    checklist:["I wrote a grouped timeline and a bounded escalation.", "I revised the case for the approved device and saved my reasoning."],
    summary:"Correlated records can raise priority. Attribution requires corroboration, and new facts should change the decision without altering the original timeline.",
    encouragement:"Your escalation gives the next analyst enough information to verify the pattern and understand what remains open.",
    questions:[
      {prompt:"Which records show an eli failure followed by an eli success from the same source?",choices:["A01 and A04","D01 and A04","A02 and A03","A01 and D01"],correct:2,explanation:"A02 and A03 share both eli and the source. D01 is related through account only."},
      {prompt:"What does D01 establish?",choices:["eli had a new-device signal","The IP belongs to an attacker","mira enrolled the device","eli completed MFA"],correct:0,explanation:"D01 associates a new-device event with eli. It does not provide IP ownership or MFA information."},
      {prompt:"The owner confirms L-17 was approved. What is the strongest revision?",choices:["Delete the records","Close every alert from this network","Declare that MFA failed","Remove the device concern and verify the remaining auth pattern"],correct:3,explanation:"The new fact resolves one concern. Investigate the remaining auth evidence in its own right."}
    ]
  },
  {
    id:"red-rebuild/service-inventory",
    track:"pentest",level:"Intermediate",module:"Network Discovery and Nmap",
    title:"Read a recorded service inventory",
    objectives:["Interpret host, port, state and service fields from a static inventory.", "Reconcile observations with scope and state reviewer-safe findings."],
    preparation:"An IP address identifies a network endpoint. TCP is a transport protocol; a port is a numbered endpoint within that protocol. A service is a program accepting requests. Use the offline transcript only. The addresses are documentation examples.",
    theory:[
      "An assessment starts with a signed scope, which identifies assets, allowable methods and stop conditions. A network inventory helps check whether the observed services match an approved asset list. Read an inventory row together with its target IP and its observation point. Reachability may differ across networks.",
      "A recorded open state means the observation saw a service accepting a connection. Closed means the host gave a negative result. Filtered means the observation lacked a decisive reply. A label is a clue about what might be there. Product and version assertions require a trusted configuration or vendor-supported inventory source.",
      "A finding describes evidence, impact and remediation. An unexpected administrative interface can be worth investigating before any claim of a vulnerability. Restricting exposure to a management network is one control. A change owner can verify the expected reachability from both the management network and the restricted network."
    ],
    terms:[["Scope","The approved boundaries and methods for an assessment."],["Observation point","The network location from which a measurement was made."],["Service inventory","A list of observed services and their associated assets."]],
    flow:["Read approved asset list", "Parse saved rows", "Flag exposure differences", "Ask owner for a retest"],
    fixture:"SCOPE: 192.0.2.10 only; catalog allows TCP/443 from learner VLAN\nRECORD R01 192.0.2.10 443/tcp open     https\nRECORD R02 192.0.2.10  22/tcp open     ssh\nRECORD R03 192.0.2.10 445/tcp filtered microsoft-ds\nRECORD R04 192.0.2.27 443/tcp open     https",
    steps:["Start with the scope statement. Put R04 in an out-of-scope column and record only why you excluded it.", "Build three columns for approved, unexpected and inconclusive results. Place each in-scope row into the appropriate column.", "Write a finding for the unexpected management service. Cite the exact address, observation point and transcript row.", "Define a regression check that an owner can perform after restricting exposure. Require both permitted management access and restricted learner access."],
    expected:"R01 matches the inventory. R02 shows unexpected SSH reachability from the learner VLAN. R03 is inconclusive. R04 is out of scope. No record identifies a vulnerable version.",
    troubleshoot:"If you treat filtered as closed, revisit the distinction between a negative result and an absence of decisive evidence. If you report a product from a service label, qualify the identification.",
    independent:"The owner supplies a new record: R05 192.0.2.10 22/tcp filtered from learner VLAN. Explain what observation supports the restriction and what evidence is still needed to show maintenance can work.",
    evidence:"Save the scoped table, finding and before-and-after description. Include a request for one management-side confirmation.",
    checklist:["I classified all rows against scope and expected exposure.", "I saved the retest interpretation and its remaining uncertainty."],
    summary:"Inventory gives a view of reachability and scope. Verified service identity, vulnerability and impact each need additional evidence.",
    encouragement:"You turned four inventory rows into a defensible exposure finding and a precise retest request.",
    questions:[
      {prompt:"Which record supports the unexpected in-scope exposure?",choices:["R03","R02","R04","R01"],correct:1,explanation:"R02 is the only open in-scope service outside the approved TCP/443 exposure."},
      {prompt:"What can you infer from the filtered SMB row?",choices:["The server is compromised","SMB is confirmed patched","The observation did not resolve reachability","The service is definitely closed"],correct:2,explanation:"Filtered indicates uncertainty at the observation point, often due to network controls."},
      {prompt:"What can close the management impact question after R05?",choices:["A scoped observation from the management network","An unrelated host result","Another learner-side filtered result alone","Deleting the earlier observation"],correct:0,explanation:"The change should restrict learner access and preserve approved management access. The second property needs a management-side observation."}
    ]
  },
  {
    id:"soc-rebuild/detection-evaluation",
    track:"soc",level:"Advanced",module:"Detection Engineering",
    title:"Validate an authentication detection before deployment",
    objectives:["Evaluate detection precision and recall from adjudicated data.", "Write a measurable tuning proposal and identify missing telemetry."],
    preparation:"Recall the roles of a log, an alert and an analyst's disposition. A disposition is a decision supported by investigation. A detection is logic that flags records for investigation. Use the labeled offline cases below; there is no deployment step.",
    theory:[
      "A true positive is an alerted case that really meets the target behavior. A false positive is a benign case that alerts. A false negative is a target case that did not alert. A true negative is a benign case that did not alert. Labels should come from independent investigation or synthetic cases with known truth.",
      "Precision is true positives divided by everything that alerted. Recall is true positives divided by everything that should have alerted. Lowering alert volume can reduce workload but also suppress relevant cases. When the denominator is zero, the corresponding metric is undefined.",
      "Tune with trust boundaries. Excluding all sign-ins from a shared address hides behavior involving that address. A narrower exception can require a registered service identity plus a verified change window. Reserve separate validation cases to reduce overfitting and check what happens when a required field is absent."
    ],
    terms:[["Precision","The fraction of alerts that target the intended behavior."],["Recall","The fraction of intended behavior the rule actually alerted on."],["Holdout","Cases kept separate while designing a rule so that testing is independent."]],
    flow:["Read alert and ground truth", "Label outcomes", "Compute metrics", "Choose a monitored rollout gate"],
    fixture:"CASE  TRUTH    ALERT  CONTEXT\nA     target   yes    unusual account\nB     benign   yes    registered service during change\nC     target   no     source address missing\nD     benign   no     ordinary user activity\nE     target   yes    service identity outside change",
    steps:["Assign TP, FP, FN or TN to all five rows in your notes.", "Compute precision and recall. Show each numerator and denominator before rounding.", "Propose an exception that can suppress B while preserving E. Write the exact conditions in plain language.", "Propose a separate test for missing source. State how to check data quality and how to prevent a missing value from becoming an automatic exclusion."],
    expected:"A and E are true positives, B is a false positive, C is a false negative and D is a true negative. Precision and recall are both 2/3, about 67%. The missing-data test requires more than a simple count of alerts.",
    troubleshoot:"If precision and recall match here, check the different denominators anyway. If you excluded E, recheck the change window. A trusted service identity alone is insufficient.",
    independent:"A holdout adds one benign service case outside the change window that alerts and one target case with missing source that does not. Recompute both metrics on all seven cases before changing the rule, then state which failure to investigate first.",
    evidence:"Keep outcome counts, calculations, exception conditions and a rollout recommendation with one monitoring metric and a rollback trigger.",
    checklist:["I calculated metrics from independent labels and stated the tuning conditions.", "I saved a holdout decision, a missing-data check and a rollout guardrail."],
    summary:"Rule quality depends on both alert relevance and coverage. Record the reasons for exceptions and measure what the rule misses.",
    encouragement:"You made a detection recommendation that another engineer can reproduce, challenge and monitor.",
    questions:[
      {prompt:"What are the original true positive and false negative counts?",choices:["1 and 2","3 and 1","2 and 2","2 and 1"],correct:3,explanation:"A and E are detected targets. Target case C has no alert."},
      {prompt:"What are the original precision and recall?",choices:["2/3 and 2/3","1/2 and 1/2","2/5 and 3/5","1 and 2/3"],correct:0,explanation:"There are three alerts and three target cases; two cases appear in both sets."},
      {prompt:"What happens to precision and recall on all seven cases before tuning?",choices:["Both become 1","Precision alone becomes 1","Both become 1/2","Recall becomes 2/3 and precision becomes 1/2"],correct:2,explanation:"One additional false positive and one additional false negative give two true positives among four alerts and four target cases."},
      {prompt:"Which exception best preserves case E?",choices:["All traffic from the service IP","Known service identity and verified change window","All service identities","All records with missing source"],correct:1,explanation:"The bounded rule can exclude B while ensuring E remains visible outside the window."}
    ]
  },
  {
    id:"red-rebuild/authorization-review",
    track:"pentest",level:"Advanced",module:"Advanced Web and Application Security",
    title:"Assess an object authorization control from test records",
    objectives:["Read an access-control matrix and distinguish authentication from object authorization.", "Write a finding and an owner-run regression plan from sanitized observations."],
    preparation:"An API is a way for programs to request data or actions. Authentication identifies a caller. Authorization determines whether that caller may perform an action on an object. Status 200 represents success in these test records, 403 an access denial and 401 missing or invalid authentication. Use the recorded data only.",
    theory:[
      "An application may authenticate two users correctly while checking authorization incorrectly. Object-level authorization means judging access to the particular record, rather than confirming only that the caller can use the feature. Tenant isolation is the requirement that a customer organization can see only its own resources unless a documented exception applies.",
      "Build expected results from the business policy and an access matrix. Include the actor role, resource ownership, requested operation and expected result. Compare recorded results and verify whether private data actually appeared. A 200 status alone may be a generic acknowledgement, while a returned private field is evidence of disclosure.",
      "A remediation should apply to the server-side data decision and across equivalent paths. Owner-run regression checks should include valid access, denied cross-tenant access and a documented exception. Evidence should be minimally sufficient and omit real customer data."
    ],
    terms:[["Tenant","A customer or organizational security boundary in a shared service."],["Object","The individual record, such as an invoice, governed by the policy."],["Regression check","An observation that confirms a fix works and permitted behavior still works."]],
    flow:["Read policy", "Predict each authorization result", "Compare response and evidence", "Plan allow and deny checks"],
    fixture:"POLICY: Members may read own-tenant invoices; finance reviewers may read only explicitly assigned invoices.\nT01 actor=member:A invoice=A1 assignment=no status=200 private_total=yes\nT02 actor=member:A invoice=B1 assignment=no status=200 private_total=yes\nT03 actor=finance:A invoice=B2 assignment=yes status=200 private_total=yes\nT04 actor=anonymous invoice=A1 assignment=no status=401 private_total=no",
    steps:["Write expected allow or deny for all four observations before comparing their recorded status.", "Find the policy mismatch. Cite the row and name the exposed field class without inventing values.", "Rate impact conditionally: identify what the record confirms and what you would ask the owner to quantify.", "Define four owner-run regression checks including a legitimate same-tenant read, denial for a cross-tenant member, a permitted reviewer exception and denial for an unassigned reviewer."],
    expected:"T02 conflicts with policy and indicates private invoice totals were returned. T03 is a documented exception. The fixture alone does not establish the number of invoices, real customers or other endpoints involved.",
    troubleshoot:"If you flag T03, reread the assignment condition. If your finding attributes a code-level cause, replace it with the observed decision mismatch unless source review confirms the cause.",
    independent:"The owner supplies T05 actor=finance:A invoice=B3 assignment=no status=200 private_total=no. Decide whether the record proves data disclosure. Ask for a body category or authorization audit event to determine if the wrong status masks correct denial.",
    evidence:"Save the access matrix, a two-sentence finding, a qualified impact statement and a four-row regression matrix.",
    checklist:["I compared all four records to policy and cited the supported finding.", "I saved the regression matrix and explained the ambiguity in T05."],
    summary:"An authenticated identity may still be unauthorized for a specific resource. Verify the enforcement decision and distinguish status from the data returned.",
    encouragement:"Your access matrix gives a developer an actionable fix and a dependable way to verify it.",
    questions:[
      {prompt:"Which record supports a confirmed policy mismatch and disclosure in the fixture?",choices:["T01","T03","T02","T04"],correct:2,explanation:"T02 shows a member receiving the private field of another tenant’s invoice without an exception."},
      {prompt:"Why is T03 expected to succeed?",choices:["Every reviewer can see every invoice","The reviewer is assigned to this invoice","A 200 always proves the policy permits access","All same-role callers have identical access"],correct:1,explanation:"The policy explicitly permits assigned reviewer access."},
      {prompt:"What does T05 demonstrate by itself?",choices:["Every invoice leaks","Code review identified the flawed predicate","No authorization was evaluated","An ambiguous success status without a recorded private total"],correct:3,explanation:"The response status and field-presence evidence differ. Examine the authorized audit record or the category of response before asserting disclosure."},
      {prompt:"What belongs in a balanced regression matrix?",choices:["Allowed and denied cases, including reviewer assignment boundaries","Only denied requests","Only a check for HTTP 200","Only one known invoice"],correct:0,explanation:"Both access preservation and isolation need coverage, including the boundary of the documented exception."}
    ]
  }
];
