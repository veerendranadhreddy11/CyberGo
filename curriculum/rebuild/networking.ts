import type { RebuildLesson } from "./representative";

export const networkingLessons: RebuildLesson[] = [
  {
    id:"soc-rebuild/network-baseline", track:"soc", level:"Foundation",
    module:"Networking Fundamentals", title:"Follow a connection across a network",
    objectives:["Explain IP addresses, a local subnet, a gateway, and TCP and UDP ports.", "Identify what a firewall record proves and choose independent evidence to verify delivery."],
    preparation:"Complete the three beginner SOC modules. Recall that a process is a running program and a log describes an observation. All addresses and records below are synthetic and bundled; no capture or internet access is required.",
    theory:[
      "A network connects devices using agreed rules called protocols. A packet is a unit of data that travels across the network. The Internet Protocol gives packets source and destination addresses. IPv4 addresses generally look like four decimal numbers separated by dots. IPv6 addresses use hexadecimal groups separated by colons, as in 2001:db8::20, which is reserved for documentation.",
      "A subnet groups addresses. In this IPv4 example, 10.12.8.0/24 groups addresses with the first three numbers fixed at 10, 12 and 8. A router joins networks. A default gateway is the router address a device typically uses for destinations outside its subnet when no more specific route applies.",
      "A port is a number identifying a transport endpoint on a device. TCP establishes a connection and delivers bytes in order. UDP sends individual messages without promising delivery or order. HTTPS is commonly carried on port 443 and DNS commonly uses port 53. A firewall decision and an application result describe different points in the journey."
    ],
    terms:[["Endpoint","A network participant or a specific address, transport protocol and port."],["Subnet","A range of network addresses that share an address prefix."],["Firewall","A control that permits or blocks traffic according to rules."]],
    flow:["Application makes a request","Transport identifies the port","IP identifies the destination","Firewall logs a decision"],
    fixture:"CLIENT · 10.12.8.20/24 with default gateway 10.12.8.1\nF01 UDP 10.12.8.20 -> 10.12.8.53:53 PERMIT\nF02 TCP 10.12.8.20 -> 192.0.2.40:443 PERMIT\nF03 TCP 10.12.8.20 -> 192.0.2.40:22 DENY",
    steps:["Copy each record as protocol, source, destination, port and decision. Compare the source and destination prefixes.", "Identify which destination is on the local subnet and which destination normally uses the gateway.", "Map the recorded port numbers to the likely services. Treat an unfamiliar label as uncertain until a trusted source confirms the service.", "Explain whether F02 alone proves an HTTPS request succeeded. Name one independent record that can establish the application result."],
    expected:"F01 stays within 10.12.8.0/24 under the stated addressing. F02 and F03 are outside that subnet. F02 allows traffic to the usual HTTPS port but does not establish connection completion or the response status.",
    troubleshoot:"Separate the colon introducing a port in these IPv4 examples from the colons within an IPv6 address. Compare the destination address, not the port, when deciding whether a gateway is needed.",
    independent:"A service log tied to F02 by time and client address reports HTTP 503, which indicates the service was unavailable for the request. Explain how a firewall permit and that result can both be true, then request one application-side follow-up.",
    evidence:"Save your record table, the routing decisions, and two sentences separating firewall evidence from application evidence.",
    checklist:["I classified the routes and ports using the recorded fields.", "I saved an explanation that reconciles firewall and application evidence."],
    summary:"The destination address helps determine routing, the port describes a transport endpoint, and each log source proves only what it observed.",
    encouragement:"You followed a request through three layers and chose evidence that answers the next question.",
    questions:[
      {prompt:"Which record shows a destination on the local /24 subnet?",choices:["F02","F03","F01","Both F02 and F03"],correct:2,explanation:"Only F01 targets an address beginning 10.12.8. F02 and F03 target 192.0.2.40."},
      {prompt:"What can F02 by itself establish?",choices:["The firewall permitted the observed TCP traffic","An application returned 200","DNS was never required","The destination is local"],correct:0,explanation:"F02 is a firewall observation. It contains no application response or completion status."},
      {prompt:"Do UDP messages inherently guarantee delivery and order?",choices:["Yes, even without a response","Only when using port 53","Yes, on a local subnet","No, the transport makes neither guarantee"],correct:3,explanation:"UDP transmits individual datagrams. An application may provide its own retry or reliability mechanisms."}
    ]
  },
  {
    id:"red-rebuild/network-endpoints", track:"pentest", level:"Foundation",
    module:"Networking Fundamentals", title:"Distinguish hosts, ports, and services",
    objectives:["Interpret network address, subnet, transport, port and service fields.", "Read a permitted inventory and explain the limits of a service label."],
    preparation:"Complete the beginner Red Team modules on computers, security, and scope. Remember that a client requests a service and permission has an explicit boundary. This exercise uses a mock office inventory. Do not contact any network.",
    theory:[
      "A network connects devices. A local area network typically covers a home or workplace. Routing moves data between networks. IP addresses identify the endpoints used to carry packets. IPv4 uses four decimal values, as in 10.24.4.20. IPv6 uses hexadecimal groups, as in 2001:db8::20. A prefix groups addresses. The IPv4 prefix 10.24.4.0/24 covers addresses with the same first three values.",
      "TCP and UDP are distinct transport protocols with separate port spaces. TCP manages a connection and delivers ordered bytes. UDP carries separate messages and does not establish a connection the way TCP does. Port numbers let one host use multiple services at once. A device can have service A on TCP port 443 and a different service or no service on UDP port 443.",
      "A port convention is a clue. HTTPS commonly uses TCP port 443. DNS commonly uses UDP and TCP port 53. An inventory becomes dependable when an owner confirms which process provides the service and who may reach it. Evidence from one network location cannot establish visibility from all locations."
    ],
    terms:[["Host","A device or virtual machine participating in a network."],["Transport","A protocol for communicating between application endpoints."],["Listener","A program ready to receive traffic for a protocol and port."]],
    flow:["Read the authorized inventory","Separate host, transport and port","Compare expected audience","Request owner confirmation"],
    fixture:"SCOPE · Read the delivered inventory for 10.24.4.0/24 only.\nI01 10.24.4.20 TCP/443 service-label=https expected-audience=office\nI02 10.24.4.53 UDP/53 service-label=dns expected-audience=office\nI03 10.24.5.20 TCP/443 service-label=https expected-audience=staff",
    steps:["Transcribe the three addresses. Mark which match the allowed first three IPv4 numbers.", "Write the transport and port of I01 and I02 as separate fields. Underline the service label as an identification clue.", "Write one question that would confirm the I01 service using the owner’s settings or records.", "Explain why knowing only the port and protocol would not independently establish who can reach the listener."],
    expected:"I01 and I02 match the authorized prefix. I03 is outside it. I01 is a TCP endpoint and I02 is UDP. The labels are plausible and need confirmation before claiming a product or version.",
    troubleshoot:"If you match I03 because its last number matches I01, compare the prefix rather than the host part. The /24 notation here fixes the first three numbers, not the last one.",
    independent:"The owner supplies a configuration entry for 10.24.4.20 UDP/443, but the inventory records only TCP/443. Explain why neither record replaces the other and what the owner could check to verify the expected audience.",
    evidence:"Save the scope decisions, a table splitting addresses from protocols and ports, and a short explanation of the independent record.",
    checklist:["I classified the inventory against the approved subnet.", "I explained why a TCP observation cannot establish the UDP service."],
    summary:"Read endpoint records as address plus transport plus port. Keep identification, reachability and authorization as separate questions.",
    encouragement:"You can now read a network inventory and ask for exactly the evidence that would confirm an endpoint.",
    questions:[
      {prompt:"Which record is outside the stated prefix?",choices:["I01","I02","I03","All three"],correct:2,explanation:"The third octet of I03 is 5. The permitted /24 uses 4 in that position."},
      {prompt:"What does the https label establish about an exact product version?",choices:["The latest version is installed","The endpoint must be vulnerable","The server is a Linux host","The label alone cannot establish a version"],correct:3,explanation:"A service label is a hint about a protocol. Verify product and version with a trusted inventory or owner record."},
      {prompt:"Does a recorded TCP/443 listener also establish a UDP/443 listener?",choices:["Yes, even across different hosts","No, the endpoints use separate transports","Only on a local network","Only when DNS succeeds"],correct:1,explanation:"A port number is interpreted with its transport. Evidence for the TCP listener does not establish a UDP listener."}
    ]
  }
];
