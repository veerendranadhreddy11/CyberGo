import type { Question } from "../../lib/teaching";

export const followUpQuestions: Record<string, Question[]> = {
  "soc-rebuild/computer-first": [
    {prompt:"Why record the complete /training/alert.txt path?",choices:["It proves the file was edited","It identifies the location another analyst can check","It measures the size of RAM","It grants permission to write"],correct:1,explanation:"A path identifies a location through its folders and helps a second analyst locate the same item."},
    {prompt:"What happens to a change that exists only in ordinary working memory after power loss?",choices:["It is always stored on disk","The original is deleted","It can be lost","It becomes a new process"],correct:2,explanation:"Ordinary RAM loses data without power. Verify a separate saved copy before treating a change as durable."}
  ],
  "red-rebuild/computer-first": [
    {prompt:"Which part of the saved exchange identifies the requested resource?",choices:["The path /catalog","The word server alone","The status number","The word client alone"],correct:0,explanation:"The path names the resource. The other fields describe the sides of the exchange or its outcome."},
    {prompt:"What does the recorded 404 for /training establish here?",choices:["The browser crashed","All testing is authorized","The server reported it could not find the requested item","The server was physically removed"],correct:2,explanation:"The status reports the result of that request and does not determine what other activities are authorized."}
  ],
  "soc-rebuild/protect-a-service": [
    {prompt:"What do the records establish about who read the exposed gradebook?",choices:["Every student opened it","No one could read it","A teacher changed it","The audience was unrestricted, but readership is unknown"],correct:3,explanation:"The permission condition establishes possible exposure. Identifying readers requires separate access evidence."},
    {prompt:"A restored gradebook contains an older version. Which concern remains?",choices:["Integrity","Address routing","Only screen availability","None if the site loads"],correct:0,explanation:"The service can be reachable while showing inaccurate information. Compare with an approved current record."}
  ],
  "red-rebuild/security-properties": [
    {prompt:"Which action in the shop records supports availability concerns?",choices:["S01","S02","S03","S04"],correct:3,explanation:"The unavailable history page demonstrates a service access problem. It does not show that receipts changed."},
    {prompt:"Which outcome establishes an integrity problem in the independent exercise?",choices:["An allowed read","An unauthorized edit to an issued total","A page load","A normal staff verification"],correct:1,explanation:"Unauthorized modification alters the accuracy or trustworthiness of stored data."}
  ],
  "soc-rebuild/first-alert": [
    {prompt:"What does H01 add to the initial case?",choices:["Proof of device compromise","A request to erase evidence","A plausible explanation to test","Proof a second person signed in"],correct:2,explanation:"The password change can explain a failed attempt. It does not establish the origin of every later event."},
    {prompt:"Which handoff is easiest for the next analyst to verify?",choices:["Something odd happened","Check everything sometime","A01 was scary","E01 at 09:10 failed; check later device records"],correct:3,explanation:"A record ID, time, observation, and bounded next step let the next analyst verify the claim and act."}
  ],
  "red-rebuild/scope-first": [
    {prompt:"Which activity best matches the stated purpose of a Red Team exercise?",choices:["Measuring detection and response against an agreed scenario","Removing authorization requirements","Testing any public site","Publishing private records"],correct:0,explanation:"A Red Team exercise measures defenses through an agreed scenario, with explicit safety and approval boundaries."},
    {prompt:"How should a scope revision be recorded?",choices:["Erase the original approval","Preserve the original and record the exact written change","Assume other terms now expire","Keep only a verbal guess"],correct:1,explanation:"Keeping both versions makes it clear what the owner approved initially and what changed."}
  ],
  "soc-rebuild/network-baseline": [
    {prompt:"What does the application’s 503 add to F02?",choices:["The permitted firewall traffic still encountered an application availability problem","The firewall denied all packets","The port is UDP","The client was on the destination subnet"],correct:0,explanation:"A firewall permit describes transport at one point. An application can still respond with a service error."},
    {prompt:"Which address is the documented gateway in the exercise?",choices:["10.12.8.20","192.0.2.40","10.12.8.1","10.12.8.53"],correct:2,explanation:"The client configuration explicitly names 10.12.8.1 as the default gateway for relevant remote destinations."}
  ],
  "red-rebuild/network-endpoints": [
    {prompt:"Which inventory row is recorded as UDP port 53?",choices:["I03","I02","I01","All rows"],correct:1,explanation:"I02 is the row with transport UDP and port 53. Read the transport and port as separate fields."},
    {prompt:"How can the owner confirm a service identity?",choices:["Infer the vendor from port 443","Assume all hosts have the same process","Assume the scope line names all service products","Check the approved service configuration or process inventory"],correct:3,explanation:"A trusted owner record provides identity evidence that a conventional port label alone cannot supply."}
  ]
};
