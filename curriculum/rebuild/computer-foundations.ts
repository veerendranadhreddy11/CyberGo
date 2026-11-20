import type { RebuildLesson } from "./representative";

export const beginnerModule = "Computer and Cybersecurity Foundations";

export const computerFoundations: RebuildLesson[] = (["soc", "pentest"] as const).flatMap(track => {
  const soc = track === "soc";
  const prefix = soc ? "soc-rebuild" : "red-rebuild";
  return [
    {
      id: `${prefix}/what-is-a-computer`, track, module: beginnerModule, level: "Absolute Beginner",
      title: "What Is a Computer?",
      objectives: ["Identify a computer by what it does.", "Distinguish input, processing, output, and storage in a familiar example."],
      preparation: "Start here even if you have never studied computers. Read the example and write in the notes box. You need no other software, accounts, or equipment.",
      theory: [
        "A computer is a device that follows instructions to work with information. A laptop is a computer. So is a phone. A shop barcode reader can contain a small computer too. Different computers have different jobs, but each can take information in, work with it, and produce a result.",
        "Information entering a computer is called input. Tapping a number on a calculator is input. Processing is what the computer does with that information. Adding two numbers is processing. Showing the total on the screen is output. Keeping a copy of the total for later is storage. A device may produce output without saving it.",
        "Software is the set of instructions a computer follows. Hardware is its physical equipment. A calculator app is software. The screen you touch and the physical parts inside the device are hardware. The word data means information represented in a form a computer can work with, such as a number, a word, or part of a picture.",
        soc ? "On a security team, you will investigate what a device did. Separate the input from the visible result and any saved record. If a screen showed a message, that alone does not establish that the message was saved." : "When assessing security with permission, you will ask which devices handle information and what they keep. A visitor pressing a key, a screen showing a message, and a device saving a record are separate observations."
      ],
      terms: [["Input", "Information or a signal given to the computer."], ["Processing", "The work done using instructions and data."], ["Output", "A result returned or presented by the computer."], ["Storage", "A place and mechanism for keeping information for later use."], ["Hardware and software", "The physical equipment and the instructions it follows, respectively."]],
      flow: ["Person enters information", "Computer follows an instruction", "Screen or another device receives a result", "A separate action may save a copy"],
      fixture: soc ? "SCHOOL OFFICE CALCULATOR\nA. A clerk taps 2, then +, then 3.\nB. The calculator adds the numbers.\nC. The screen displays 5.\nD. The clerk selects Save history and finds 5 after reopening." : "LIBRARY VISITOR COUNTER\nA. A volunteer taps the Add visitor button.\nB. The device increments its total from 4 to 5.\nC. The display shows 5.\nD. The volunteer selects Save and retrieves 5 the next morning.",
      steps: ["Read A through D in order. In your notes, label each line as input, processing, output, or storage.", "Identify one physical part used in the example. Then name the software instruction it helps carry out.", "Imagine D never happened. Write one thing C still proves and one claim about storage you could no longer support.", "Explain the four stages in one short sentence each, using your own words."],
      expected: "A is input, B is processing, C is output, and the later retrieval in D supports storage. A screen is hardware. The instructions that add numbers or update the count are software.",
      troubleshoot: "If C and D seem identical, compare their timing. Seeing the result now and retrieving a saved result later answer different questions.",
      independent: "A phone takes a picture, shows it, and then saves it. Identify one input, one processing step, one output, and one storage check. Include how you would check that the saved picture can still be opened after closing the app.",
      evidence: "Save your labels and the picture example in the notes box. Include a sentence about the difference between seeing and saving a result.",
      checklist: ["I classified the four stages in the guided example.", "I worked through the phone example and recorded the storage check."],
      summary: "Computers follow instructions. Input supplies information, processing changes or interprets it, output communicates the result, and storage keeps selected information for later.",
      encouragement: soc ? "You can now describe what a computer did in terms another analyst can check." : "You’ve taken the first step toward mapping what a device handles and what it retains.",
      questions: [
        {prompt:"Which description best fits a computer?",choices:["A screen that can show a number","A device that follows instructions to work with information","Any container in which paper is stored","A machine that must be online"],correct:1,explanation:"Computers process information by following instructions. Small devices can do this without a screen or an internet connection."},
        {prompt:"What is the person’s first tap in the example?",choices:["Input","Storage","Output","A saved record"],correct:0,explanation:"The tap supplies a signal to the device before the device processes it."},
        {prompt:"What is the on-screen 5?",choices:["A physical keyboard","The calculation instruction","A saved file by definition","An output"],correct:3,explanation:"The screen presents the result. Displaying the number alone does not establish that it was stored."},
        {prompt:"Which item is software in the example?",choices:["The physical display","The button’s glass surface","The instructions that calculate the result","The device’s case"],correct:2,explanation:"Software consists of instructions. The display, glass, and case are physical parts."},
        {prompt:"Which observation best supports that the value was saved?",choices:["The value flashed on the screen","The device accepted a tap","The value was retrieved after closing and reopening","The screen became brighter"],correct:2,explanation:"Retrieving the value after reopening gives evidence that it persisted beyond the initial display."}
      ]
    },
    {
      id: `${prefix}/how-computers-work`, track, module: beginnerModule, level: "Absolute Beginner",
      title: "How Computers Work",
      objectives: ["Follow an instruction and its data through a simple device.", "Distinguish temporary working information from a saved copy."],
      preparation: "Complete What Is a Computer? first. You will use input, processing, output, and storage. This fictional example runs entirely on the page and requires no installation.",
      theory: [
        "A computer represents information in small units called bits. Each bit has a value of zero or one. Several bits together can represent a number, a letter, or a tiny part of a picture. The same bits can mean different things depending on the rules a program uses to interpret them.",
        "A processor is a physical component that carries out instructions. A program is an ordered collection of instructions. The processor repeatedly gets an instruction, interprets it, and carries it out. A calculator program can read a number, add another number, and send the answer to a display. The processor needs both the instruction and the data to act on.",
        "Working memory holds information needed during the task. Think of it like a desk where you lay out the page you are using. Saved storage is more like a drawer you can return to later. A draft can be shown from working memory before a separate save action puts it in durable storage. Power loss usually clears ordinary working memory.",
        soc ? "When you later review an incident, ask whether the evidence was an observation during the task or a record saved afterward. A missing saved copy does not rule out activity the device displayed earlier." : "When you later assess a system, draw how input becomes a saved record. This helps you identify which information an authorized check should inspect and which information is outside its scope."
      ],
      terms: [["Bit", "A single value represented as 0 or 1."], ["Processor", "The physical component that carries out instructions."], ["Program", "An ordered set of instructions."], ["Working memory", "Temporary space for information being used now."]],
      flow: ["Get the instruction", "Interpret the instruction", "Work with the data", "Display the result or save it"],
      fixture: "A. Saved note says OPEN.\nB. The editor reads OPEN into working memory.\nC. You type CLOSED and the screen shows CLOSED.\nD. The editor closes after you choose Discard.\nE. On reopening, the saved note still says OPEN.",
      steps: ["Make two columns in your notes called Working copy and Saved copy.", "At B and C, fill in both columns using OPEN and CLOSED where appropriate.", "Explain which step discarded the changed work and why E retrieves OPEN.", "Add a hypothetical line that would verify CLOSED was saved if the app had offered and confirmed a save."],
      expected: "At B both copies read OPEN. At C the working copy reads CLOSED while the saved copy remains OPEN. A later reopen showing CLOSED would support a successful save.",
      troubleshoot: "Some real applications save automatically. Follow the facts in this fictional editor first. Then explain what additional record would identify an automatic save in a real app.",
      independent: "A draft changes from 10 to 12 and then to 14. The user saves at 12 and discards the later edit. Predict the reopened value and explain the difference between what was displayed and what was saved.",
      evidence: "Keep the two-column table, your proposed verification line, and your reasoning for the number in the independent exercise.",
      checklist: ["I tracked both copies and explained what discard did.", "I predicted the reopened number and explained my evidence."],
      summary: "Instructions tell a processor what to do with data. Working information changes during the task. A successful save updates the separate copy a program can later reload.",
      encouragement: soc ? "You followed a changing value through memory and storage, an important distinction when reviewing an incident." : "Your data-flow notes separate what a program displayed from what a later assessment can verify.",
      questions: [
        {prompt:"What two values can one bit represent?",choices:["1 and 2","Any two words","0 and 1","Only a letter"],correct:2,explanation:"A bit has two possible values. Groups of bits can represent more complex information."},
        {prompt:"Which component carries out program instructions?",choices:["The processor","The desk","A saved icon","The device case"],correct:0,explanation:"The processor fetches, interprets, and carries out instructions using data provided to it."},
        {prompt:"What does the saved note contain at C?",choices:["CLOSED","An empty page","Both versions necessarily","OPEN"],correct:3,explanation:"The edit only changed the working copy. The example contains no save action at C."},
        {prompt:"Which action best establishes that a saved copy can be retrieved?",choices:["Read the editor preview before saving","Reopen the saved item and inspect its content","Count the characters typed","Look at the screen brightness"],correct:1,explanation:"Reopening the saved item checks the result of retrieval, independently of the earlier working copy."},
        {prompt:"Which value reopens in the independent exercise?",choices:["14","10","12","No value"],correct:2,explanation:"The user saved at 12 and discarded the edit to 14, leaving 12 in storage."}
      ]
    }
  ];
});
