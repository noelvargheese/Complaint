const API="https://script.google.com/macros/s/AKfycbyRlfGsTJaMP49u5g_pVAZEzSaFHOxdtcfqRfspMihQ_cqW782mmXPerALCDPTwGul3Bw/exec";

let complaints=[];
let filtered=[];

const cards=document.getElementById("cards");
const search=document.getElementById("search");

load();

async function load(){

    const res=await fetch(API+"?action=complaints");

    complaints=await res.json();

    complaints.reverse();

    filtered=complaints;

    render();

}

function render(){

    cards.innerHTML="";

    let pending=0;
    let progress=0;
    let completed=0;

    filtered.forEach(c=>{

        if(c.status=="Pending") pending++;
        if(c.status=="In Progress") progress++;
        if(c.status=="Completed") completed++;

        let cls="pending";

        if(c.status=="In Progress") cls="progress";
        if(c.status=="Completed") cls="completed";

        cards.innerHTML+=`

<div class="card">

<h2>${c.id}</h2>

<p><b>Category:</b> ${c.category}</p>

<p><b>System:</b> ${c.system}</p>

<p><b>Type:</b> ${c.type}</p>

<p><b>Priority:</b> ${c.priority}</p>

<p><b>Location:</b> ${c.location}</p>

<p>${c.description}</p>

<p><b>Assigned:</b> ${c.assigned||"-"}</p>

<span class="badge ${cls}">${c.status}</span>

<div class="assign">

<input id="assign-${c.id}" placeholder="Assign To">

<select id="status-${c.id}">

<option ${c.status=="Pending"?"selected":""}>Pending</option>

<option ${c.status=="In Progress"?"selected":""}>In Progress</option>

<option ${c.status=="Completed"?"selected":""}>Completed</option>

</select>

</div>

<div class="buttons">

<button onclick="assign('${c.id}')" class="assignBtn">Assign</button>

<button onclick="updateStatus('${c.id}')" class="statusBtn">Update</button>

<button onclick="completeTask('${c.id}')" class="completeBtn">Complete</button>

</div>

</div>

`;

    });

    document.getElementById("total").innerText=filtered.length;
    document.getElementById("pending").innerText=pending;
    document.getElementById("progress").innerText=progress;
    document.getElementById("completed").innerText=completed;

}

search.onkeyup=()=>{

    const k=search.value.toLowerCase();

    filtered=complaints.filter(c=>

        c.id.toLowerCase().includes(k)||
        c.category.toLowerCase().includes(k)||
        c.system.toLowerCase().includes(k)||
        c.type.toLowerCase().includes(k)||
        c.location.toLowerCase().includes(k)

    );

    render();

}

async function assign(id){

    const person=document.getElementById("assign-"+id).value;

    if(person=="") return alert("Enter Name");

    await fetch(API+

    "?action=assignTask&id="+id+

    "&assigned="+encodeURIComponent(person));

    load();

}

async function updateStatus(id){

    const status=document.getElementById("status-"+id).value;

    await fetch(API+

    "?action=updateStatus&id="+id+

    "&status="+encodeURIComponent(status));

    load();

}

async function completeTask(id){

    await fetch(API+

    "?action=completeTask&id="+id);

    load();

}

document.getElementById("refresh").onclick=load;

setInterval(load,30000);
