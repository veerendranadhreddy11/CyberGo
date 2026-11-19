# CyberNex curriculum rebuild specification

Each entry groups related material into teaching, guided practice, and transfer work. Module ordering is a prerequisite chain unless a lesson explicitly calls for an earlier dependency. Both tracks teach their own foundations.

The first review batch includes six representative lessons. A follow-on batch adds two beginner lessons on service protection and assessment scope. The mapped modules below are planned for the full courses. The application does not award credit for planned lessons.

## SOC · Absolute Beginner

| Module | Instruction and practice |
| --- | --- |
| 01 · Introduction to Computers | What a computer is · Hardware and software · CPU, RAM, and storage · What an operating system does · Applications and processes · Files and folders · Basic computer terminology · How computers communicate |
| 02 · Introduction to Cybersecurity | What cybersecurity means · Why cybersecurity exists · Common cybersecurity threats · Malware, phishing, and ransomware · Confidentiality, integrity, and availability · Threats, vulnerabilities, and risks · Basic security principles |
| 03 · Introduction to SOC and Blue Team | What SOC stands for · Why companies use SOC teams · What SOC Analysts do · Blue Team responsibilities · Security monitoring · Security incidents · Basic incident investigation · SOC workflows · SOC Analyst responsibilities at different experience levels |

## SOC · Foundation

| Module | Instruction and practice |
| --- | --- |
| 04 · Networking Fundamentals | What a network is · LAN and WAN · Internet fundamentals · IP addresses · IPv4 and IPv6 · Private and public IP addresses · Subnets · Routers and switches · TCP and UDP · Ports · DNS, DHCP, HTTP, HTTPS, SSH · OSI and TCP/IP models · Packet transmission · Network troubleshooting |
| 05 · Windows Fundamentals | Windows architecture · User accounts · Administrators and permissions · Processes and services · Windows networking · File systems · Event Viewer · Windows logs · PowerShell fundamentals · Basic Windows security |
| 06 · Linux Fundamentals | What Linux is · Linux distributions · Terminal basics · File navigation · Permissions · Users and groups · Processes · Services · Package management · Linux networking · Authentication logs · Bash fundamentals |
| 07 · Security Fundamentals | Common attacks · Authentication and authorization · Access control · Encryption basics · Firewalls · Endpoint security · Antivirus and EDR fundamentals · Vulnerability management · Security policies · Security frameworks |

## SOC · Intermediate

| Module | Instruction and practice |
| --- | --- |
| 08 · Building a SOC Laboratory | Virtualization · VMware and suitable alternatives · Windows and Linux virtual machines · Isolated laboratory networking · Installing and configuring laboratory tools · Security precautions · Troubleshooting connectivity |
| 09 · Security Logs | What logs are · Why logs matter · Windows Event Logs · Linux authentication logs · Network logs · Firewall logs · Web server logs · Log formats · Timestamps · Filtering and searching · Recognizing suspicious events |
| 10 · Wireshark and Network Analysis | Packet capture fundamentals · Wireshark installation · Network interfaces · Capture filters · Display filters · TCP conversations · DNS analysis · HTTP analysis · TLS metadata · Suspicious traffic investigation · Practical PCAP exercises |
| 11 · SIEM Fundamentals | SIEM architecture · Log ingestion · Normalization · Correlation · Alerts · Detection rules · Dashboards · Alert prioritization · False positives · Investigation workflows |
| 12 · Wazuh | Wazuh architecture · Installation · Agent configuration · Log ingestion · File integrity monitoring · Security alerts · Detection rules · Dashboards · Incident investigation · Troubleshooting |
| 13 · Endpoint Monitoring | Endpoint telemetry · Windows Sysmon · Endpoint Detection and Response · Process trees · Suspicious execution · Persistence indicators · Endpoint investigation |
| 14 · SOC Alert Investigation | Authentication alerts · Suspicious process activity · Network anomalies · Malware indicators · Alert triage · Evidence collection · Escalation procedures · Investigation documentation |

## SOC · Advanced

| Module | Instruction and practice |
| --- | --- |
| 15 · MITRE ATT&CK | ATT&CK framework · Tactics · Techniques · Procedure examples · Defensive detection mapping · Investigation scenarios · ATT&CK-based reporting |
| 16 · Threat Intelligence | Indicators of compromise · Threat intelligence sources · Intelligence quality · IOC enrichment · Threat actor behavior · Intelligence-driven investigation |
| 17 · Incident Response | Incident preparation · Detection · Analysis · Containment · Eradication · Recovery · Lessons learned · Evidence preservation · Incident reporting |
| 18 · Detection Engineering | Detection logic · Sigma rules · Detection testing · Alert tuning · Detection validation · False-positive reduction · Detection coverage |
| 19 · Threat Hunting | Threat-hunting hypotheses · Investigative queries · Behavioral analysis · Endpoint hunting · Network hunting · Documenting findings |
| 20 · Security Automation | Python fundamentals for security · Bash scripting · PowerShell · Log parsing · IOC processing · Alert enrichment · Security workflow automation |
| 21 · Cloud Security Monitoring | Cloud fundamentals · Cloud identity · Cloud audit logs · Cloud monitoring · Common cloud threats · Cloud incident investigations |
| 22 · Digital Forensics Fundamentals | Forensic evidence · Chain of custody · File metadata · Disk and memory concepts · Timeline analysis · Artifact investigation · Documentation |

## SOC · Professional Practice

| Module | Instruction and practice |
| --- | --- |
| 23 · Realistic SOC Investigations | Suspicious login activity · Phishing · Malware indicators · Endpoint anomalies · Network intrusions · Web server attacks · Account compromise · Data exfiltration indicators |
| 24 · Complete SOC Project | Building a monitoring laboratory · Configuring log sources · Generating safe test events · Creating detection rules · Investigating alerts · Collecting evidence · Writing professional reports |
| 25 · Independent SOC Assessment | Analyze evidence · Identify suspicious activity · Explain findings · Prioritize risks · Recommend appropriate responses · Produce a professional investigation report |

## Red Team · Absolute Beginner

| Module | Instruction and practice |
| --- | --- |
| 01 · Introduction to Computers | Teach basic computers, hardware, software, operating systems, files, processes, and networking concepts |
| 02 · Introduction to Cybersecurity | Teach cybersecurity fundamentals, threats, vulnerabilities, risks, and defensive security principles |
| 03 · Ethical Hacking and Red Team Fundamentals | What ethical hacking means · What penetration testing means · What Red Team operations mean · Differences between Red Team and penetration testing · Authorization · Rules of engagement · Scope · Responsible disclosure · Professional ethics |

## Red Team · Foundation

| Module | Instruction and practice |
| --- | --- |
| 04 · Networking Fundamentals | IP addressing · Subnets · TCP and UDP · Ports · DNS · HTTP and HTTPS · SSH · SMB · Network protocols · Packet analysis · Routing · Firewalls |
| 05 · Linux Fundamentals | Teach terminal navigation, permissions, processes, services, Bash, networking commands, and troubleshooting |
| 06 · Windows Fundamentals | Teach Windows administration, PowerShell, users, groups, permissions, services, networking, and basic security architecture |
| 07 · Programming Foundations | Python basics · Variables · Conditions · Loops · Functions · Files · JSON · Regular expressions · HTTP requests · Error handling · Scripting fundamentals |
| 08 · Building a Pentesting Laboratory | Virtualization · Kali Linux · Windows and Linux targets · Vulnerable training machines · Isolated networks · Snapshots · Troubleshooting · Safe laboratory practices |

## Red Team · Intermediate

| Module | Instruction and practice |
| --- | --- |
| 09 · Penetration Testing Methodology | Engagement planning · Authorization and scope · Asset inventory · Reconnaissance · Enumeration · Vulnerability analysis · Controlled validation · Evidence collection · Reporting · Remediation guidance |
| 10 · Network Discovery and Nmap | Host discovery · TCP scanning concepts · UDP scanning concepts · Service detection · Version detection · Nmap output formats · Scan interpretation · Responsible scanning · Practical isolated laboratory exercises |
| 11 · Service Enumeration | HTTP · DNS · SSH · SMB · FTP · TLS services · Service identification · Misconfiguration analysis · Documentation |
| 12 · Vulnerability Assessment | Vulnerability identification · CVE and CWE · CVSS · Security advisories · Vulnerability scanners · False positives · Risk prioritization · Safe validation |
| 13 · Web Application Fundamentals | Browser-server communication · HTTP requests · HTTP responses · Cookies · Sessions · Authentication · Authorization · HTML · JavaScript fundamentals · APIs |
| 14 · Burp Suite | Installation · Proxy configuration · Browser configuration · Intercepting requests · Inspecting responses · Repeater · Traffic analysis · Controlled training exercises |
| 15 · OWASP Top 10 | Teach the current OWASP Top 10 categories with examples and controlled practice |
| 16 · Web Vulnerability Testing | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 17 · API Security Testing | REST APIs · Authentication · Authorization · API access control · Input validation · API security testing · Reporting |

## Red Team · Advanced

| Module | Instruction and practice |
| --- | --- |
| 18 · Controlled Exploitation Fundamentals | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 19 · Linux Privilege Escalation | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 20 · Windows Privilege Escalation | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 21 · Active Directory Security | Domains · Domain controllers · Kerberos · LDAP · Users · Groups · Group Policy · Common AD security weaknesses · Defensive recommendations · Authorized AD security laboratories |
| 22 · Network Segmentation and Internal Security | Network trust boundaries · Segmentation · Firewall rules · Internal assessment methodology · Identity-based access · Exposure validation |
| 23 · Advanced Web and Application Security | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 24 · Python Security Automation | Parsing Nmap XML · Processing JSON · Automating repetitive authorized lab checks · Generating reports · Evidence management · Error handling · Automated testing |
| 25 · Red Team Operations Fundamentals | Red Team objectives · Threat-informed testing · Rules of engagement · Attack scenario planning · Exercise safety · Detection validation · Purple Team collaboration · Exercise reporting |

## Red Team · Professional Practice

| Module | Instruction and practice |
| --- | --- |
| 26 · Professional Penetration Testing Reporting | Executive summaries · Technical findings · Risk ratings · Evidence · Reproduction steps · Remediation recommendations · Retesting · Final assessment documentation |
| 27 · Complete Network Pentesting Project | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 28 · Complete Web Application Security Project | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 29 · Active Directory Security Project | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |
| 30 · Independent Final Assessment | Review synthetic records and security controls · compare approved access against expected behavior · document remediation and regression checks |

## Publishing and compatibility

- Ship reviewed lessons with permanent, track-prefixed IDs. Append lessons under new IDs when adding content. Existing IDs and their question ordering stay stable.
- Teach concepts and prerequisites before practice. Use bundled scenarios and evidence files for offline work. External installations remain optional when a record-based activity can demonstrate the same skill.
- Keep archived legacy records, notes, and evidence in their existing SQLite store and backup format. A historical completion cannot demonstrate a new competency automatically.
- In the review batch, the intermediate and advanced lessons supply self-contained prerequisite briefings. The final pathways must link to the intervening lessons as they are authored and validated.
- Label unanswered plans as planned. A score on an offline scenario measures the defined scenario. Independent project reports require a separate review before they count as practical mastery.

## Reference review

Reviewed on 19 November 2026. The linked reference pages returned HTTP 200. The lessons use original prose and synthetic records.

- The Cybersecurity Framework supports the vocabulary for protection, monitoring and response. [NIST CSF](https://www.nist.gov/cyberframework)
- Incident response and detection work emphasize evidence, prioritization and uncertainty. [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) · [MITRE ATT&CK](https://attack.mitre.org/)
- The saved inventory uses the documented meanings of open, closed and filtered. [Nmap port states](https://nmap.org/book/man-port-scanning-basics.html)
- The authorization case distinguishes caller identity, object policy and the evidence of disclosure. [OWASP API Security Top 10 2023](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) · [OWASP Top 10 2025](https://top10.owasp.org/2025/)

## Review batch status

- Open **Review the new curriculum** from Home in a build of this branch. The preview uses the existing application shell and requires no starting date.
- The earlier dashboard and courses remain available on the review branch until the replacement paths are ready.
- Existing identifiers and SQLite schema version are unchanged. Review lessons use separate identifiers. They can coexist with earlier records in an export. A v2.1.0 installation does not recognize preview identifiers in an archive, so keep a pre-preview backup if you intend to return to v2.1.0.
- All review examples can be completed from the bundled text records. External installations, binary packet captures, the full prerequisite chain, module progress across multiple lessons, and independent capstone grading are still pending.

## Assessment specification

- **Beginner exit.** Explain a process, distinguish working memory from stored data, and identify who authorizes access. Use a new record and ask the learner to explain what it establishes in their own words.
- **Foundation exit.** Read a synthetic host, endpoint, and packet record. Connect identity, reachability, service behavior, and verified access through a labeled diagram. Grade interpretation and the verification choice.
- **Intermediate SOC exit.** Correlate independently logged signals, preserve the original records, prioritize the case, and explain one benign alternative. A high-priority escalation must identify supporting record IDs and an explicit next action.
- **Intermediate Red Team exit.** Use a signed mock scope and a saved exposure report. Classify out-of-scope records, interpret only permitted observations, document risk and uncertainty, and design an owner-run retest.
- **Advanced SOC exit.** Tune a detection against an independent set of expected outcomes. Grade the observable behavior, precision and recall calculation, assumptions about missing values, and rollback criteria.
- **Advanced Red Team exit.** Compare a recorded identity and resource matrix to policy. Grade confirmed findings, limitations, server-side remediation and tests of both denied and permitted behavior.
- **Professional practice.** Require the learner to submit a report on an unfamiliar evidence set. Review scope and evidence integrity first. Then grade technical interpretation, prioritization, remediation and reproducibility of safe verification. Return rubric feedback that identifies what to correct before a new attempt. Record project mastery separately from lesson completion.
