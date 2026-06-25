const API =
"https://script.google.com/macros/s/AKfycbwnN1FTyHnW81loHDekGoMEbNbucJbuHXxEiy7iQVj7iyyW4sNXR-_4i0vOQ3kzPQNLxg/exec";

const cards = document.getElementById("cards");
const search = document.getElementById("search");

const totalBox = document.getElementById("total");
const pendingBox = document.getElementById("pending");
const progressBox = document.getElementById("progress");
const completedBox = document.getElementById("completed");

let complaints = [];
let filtered = [];

load();

/*************************************************
LOAD
*************************************************/

async function load(){

    const res = await fetch(API + "?action=complaints");
    complaints = await res.json();

    complaints.reverse();

    filtered = complaints;

    render();

}

/*************************************************
RENDER
*************************************************/

function render(){

    cards.innerHTML="";

    let total=0;
    let pending=0;
    let progress=0;
    let completed=0;

    filtered.forEach(c=>{

        total++;

        if(c.status=="Pending") pending++;
        else if(c.status=="In Progress") progress++;
        else if(c.status=="Completed") completed++;

        let badge="pending";

        if(c.status=="In Progress")
            badge="progress";

        if(c.status=="Completed")
            badge="completed";

        cards.innerHTML += `

<div class="card">

<h2>${c.id}</h2>

<p><strong>Category :</strong> ${c.category}</p>

<p><strong>System :</strong> ${c.system}</p>

<p><strong>Type :</strong> ${c.type}</p>

<p><strong>Priority :</strong> ${c.priority}</p>

<p><strong>Location :</strong> ${c.location}</p>

<p><strong>Description :</strong><br>${c.description}</p>

<p><strong>Assigned :</strong> ${c.assigned || "-"}</p>

<p><strong>Date :</strong> ${c.date}</p>

<p><strong>Time :</strong> ${c.time}</p>

<span class="badge ${badge}">
${c.status}
</span>

<div class="assign">

<input
type="text"
id="assign-${c.id}"
placeholder="Assign To">

<select id="status-${c.id}">

<option>Pending</option>

<option ${c.status=="In Progress"?"selected":""}>
In Progress
</option>

<option ${c.status=="Completed"?"selected":""}>
Completed
</option>

</select>

</div>

<div class="buttons">

<button
class="assignBtn"
onclick="assign('${c.id}')">

Assign

</button>

<button
class="statusBtn"
onclick="statusUpdate('${c.id}')">

Update

</button>

<button
class="completeBtn"
onclick="complete('${c.id}')">

Complete

</button>

</div>

</div>

`;

    });

    totalBox.innerText=total;
    pendingBox.innerText=pending;
    progressBox.innerText=progress;
    completedBox.innerText=completed;

}

/*************************************************
SEARCH
*************************************************/

search.onkeyup=()=>{

    const key=search.value.toLowerCase();

    filtered=complaints.filter(c=>

        c.id.toLowerCase().includes(key)||

        c.category.toLowerCase().includes(key)||

        c.system.toLowerCase().includes(key)||

        c.type.toLowerCase().includes(key)||

        c.location.toLowerCase().includes(key)||

        c.priority.toLowerCase().includes(key)||

        c.status.toLowerCase().includes(key)

    );

    render();

};

/*************************************************
ASSIGN
*************************************************/

async function assign(id){

    const person=document
    .getElementById("assign-"+id)
    .value;

    if(person==""){

        alert("Enter Assigned Person");
        return;

    }

    await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            action:"assignTask",

            id:id,

            assigned:person

        })

    });

    load();

}

/*************************************************
STATUS UPDATE
*************************************************/

async function statusUpdate(id){

    const status=document
    .getElementById("status-"+id)
    .value;

    await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            action:"updateStatus",

            id:id,

            status:status

        })

    });

    load();

}

/*************************************************
COMPLETE
*************************************************/

async function complete(id){

    if(!confirm("Complete this complaint?"))
        return;

    await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            action:"completeTask",

            id:id

        })

    });

    load();

}

/*************************************************
REFRESH
*************************************************/

document
.getElementById("refresh")
.onclick=load;

/*************************************************
AUTO REFRESH EVERY 30 SECONDS
*************************************************/

setInterval(load,30000);
