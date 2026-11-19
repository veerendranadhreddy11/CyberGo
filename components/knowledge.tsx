"use client";
import { useState } from "react";
import type { CourseRecord } from "../lib/course";
import type { Question } from "../lib/teaching";

export function KnowledgeCheck({questions,record,save}:{questions:Question[];record?:CourseRecord;save:(attempt:CourseRecord["attempts"][number])=>void}) {
  const [index,setIndex] = useState(0);
  const [choice,setChoice] = useState<number>();
  const question = questions[index];
  const answered = record?.attempts.filter(attempt=>(attempt.question??0)===index).at(-1);
  const count = new Set(record?.attempts.map(attempt=>attempt.question??0)).size;
  return <section className="panel lesson-content">
    <h3>Knowledge check</h3><p>Question {index+1} / {questions.length} · {count} answered</p>
    <form onSubmit={event=>{
      event.preventDefault();
      if(choice!==undefined) save({question:index,choice,at:new Date().toISOString(),score:choice===question.correct?100:0});
    }}>
      <fieldset><legend>{question.prompt}</legend>{question.choices.map((answer,number)=><label className="lesson-check" key={answer}><input type="radio" name="knowledge" checked={choice===number} onChange={()=>setChoice(number)}/>{answer}</label>)}</fieldset>
      <button className="button primary" disabled={choice===undefined}>Check answer</button>
    </form>
    {answered && <p role="status"><strong>{answered.score===100?"Correct":"Review this answer"} · {answered.score}%</strong><br/>{question.explanation}</p>}
    <div className="actions">{questions.map((_,number)=><button type="button" className="button subtle" key={number} aria-label={`Question ${number+1}`} aria-pressed={number===index} onClick={()=>{setIndex(number);setChoice(undefined);}}>{number+1}</button>)}</div>
  </section>;
}
