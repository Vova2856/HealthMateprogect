const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const userInput = document.getElementById("userInput");
const history = document.getElementById("history");
const settingsBtn = document.getElementById("settingsBtn");
const aboutBtn = document.getElementById("aboutBtn");
const tempAiDiv = document.getElementById("aiTempDiv");

let userName = "Ти";
let font = "Segoe UI";

function addMessage(text, sender="AI"){
  const li=document.createElement("li");
  li.textContent = `${sender}: ${text}`;
  li.style.fontFamily=font;
  history.appendChild(li);
  li.scrollIntoView({behavior:"smooth"});
}

function typeText(element,text,callback){
  element.textContent="";
  let i=0;
  function typeChar(){
    element.textContent+=text[i];
    i++;
    if(i<text.length) setTimeout(typeChar,25);
    else if(callback) callback();
  }
  typeChar();
}

sendBtn.addEventListener("click",async()=>{
  const symptoms=userInput.value.trim();
  if(!symptoms) return;
  addMessage(symptoms,userName);
  userInput.value="";
  tempAiDiv.textContent="AI пише...";
  try{
    const res=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({symptoms})});
    const data=await res.json();
    let advice=data.advice||"AI нічого не відповів";
    advice=advice.replace(/\*\*/g,"");
    typeText(tempAiDiv,advice,()=>{addMessage(advice,"AI");});
  }catch(err){
    console.error(err);
    typeText(tempAiDiv,"Сталася помилка при підключенні до сервера.",()=>{addMessage("Сталася помилка при підключенні до сервера.","AI");});
  }
});