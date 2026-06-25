const API = "https://script.google.com/macros/s/AKfycbyRlfGsTJaMP49u5g_pVAZEzSaFHOxdtcfqRfspMihQ_cqW782mmXPerALCDPTwGul3Bw/exec";

const category=document.getElementById("category");
const system=document.getElementById("system");
const type=document.getElementById("type");
const priority=document.getElementById("priority");
const locationBox=document.getElementById("location");
const description=document.getElementById("description");

const submitBtn=document.getElementById("submitComplaint");
const refreshBtn=document.getElementById("refresh");
const taskContainer=document.getElementById("taskContainer");

window.onload=()=>{

    loadCategories();
    loadTasks();

};

async function loadCategories(){

    const res=await fetch(API+"?action=categories");
    const data=await res.json();

    category.innerHTML="<option value=''>Select Category</option>";

    data.forEach(c=>{

        category.innerHTML+=`<option>${c}</option>`;

    });

}

category.onchange=async()=>{

    system.innerHTML="<option>Select System</option>";
    type.innerHTML="<option>Select Type</option>";
    priority.value="";

    if(category.value=="") return;

    const res=await fetch(API+"?action=systems&category="+encodeURIComponent(category.value));

    const data=await res.json();

    data.forEach(s=>{

        system.innerHTML+=`<option>${s}</option>`;

    });

}

system.onchange=async()=>{

    type.innerHTML="<option>Select Type</option>";
    priority.value="";

    if(system.value=="") return;

    const res=await fetch(API+"?action=types&system="+encodeURIComponent(system.value));

    const data=await res.json();

    data.forEach(t=>{

        type.innerHTML+=`<option data-priority="${t.priority}">${t.type}</option>`;

    });

}

type.onchange=()=>{

    priority.value=
    type.options[type.selectedIndex].dataset.priority||"";

}

submitBtn.onclick=async()=>{

    if(category.value=="") return alert("Select Category");
    if(system.value=="") return alert("Select System");
    if(type.value=="") return alert("Select Type");
    if(locationBox.value=="") return alert("Enter Location");
    if(description.value=="") return alert("Enter Description");

    submitBtn.disabled=true;

    const url=API+

    "?action=addComplaint"+

    "&category="+encodeURIComponent(category.value)+

    "&system="+encodeURIComponent(system.value)+

    "&type="+encodeURIComponent(type.value)+

    "&priority="+encodeURIComponent(priority.value)+

    "&location="+encodeURIComponent(locationBox.value)+

    "&description="+encodeURIComponent(description.value);

    const res=await fetch(url);

    const result=await res.json();

    submitBtn.disabled=false;

    if(result.success){

        alert("Complaint Registered : "+result.id);

        category.selectedIndex=0;
        system.innerHTML="<option>Select System</option>";
        type.innerHTML="<option>Select Type</option>";

        priority.value="";
        locationBox.value="";
        description.value="";

        loadTasks();

    }else{

        alert(result.error||"Unable to submit.");

    }

}

async function loadTasks(){

    const res=await fetch(API+"?action=tasks");

    const tasks=await res.json();

    taskContainer.innerHTML="";

    if(tasks.length==0){

        taskContainer.innerHTML="<h3>No Pending Tasks</h3>";
        return;

    }

    tasks.reverse();

    tasks.forEach(c=>{

        taskContainer.innerHTML+=`

<div class="task-card">

<h3>${c.id}</h3>

<p><b>Category:</b> ${c.category}</p>

<p><b>System:</b> ${c.system}</p>

<p><b>Type:</b> ${c.type}</p>

<p><b>Priority:</b> ${c.priority}</p>

<p><b>Location:</b> ${c.location}</p>

<p>${c.description}</p>

<span class="status pending">${c.status}</span>

</div>

`;

    });

}

refreshBtn.onclick=loadTasks;
