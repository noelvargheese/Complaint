const API =
"https://script.google.com/macros/s/AKfycbwnN1FTyHnW81loHDekGoMEbNbucJbuHXxEiy7iQVj7iyyW4sNXR-_4i0vOQ3kzPQNLxg/exec";

const category = document.getElementById("category");
const system = document.getElementById("system");
const type = document.getElementById("type");
const priority = document.getElementById("priority");
const locationBox = document.getElementById("location");
const description = document.getElementById("description");

const submitBtn = document.getElementById("submitComplaint");
const refreshBtn = document.getElementById("refresh");

const taskContainer = document.getElementById("taskContainer");

window.onload = () => {

    loadCategories();
    loadTasks();

};

/************************************************
LOAD CATEGORIES
************************************************/

async function loadCategories(){

    const res = await fetch(API+"?action=categories");
    const data = await res.json();

    category.innerHTML="<option value=''>Select</option>";

    data.forEach(c=>{

        category.innerHTML += `
        <option value="${c}">
            ${c}
        </option>`;

    });

}

/************************************************
CATEGORY CHANGE
************************************************/

category.onchange = async ()=>{

    system.innerHTML="<option>Select</option>";
    type.innerHTML="<option>Select</option>";
    priority.value="";

    if(category.value=="") return;

    const res = await fetch(

        API+
        "?action=systems&category="+
        encodeURIComponent(category.value)

    );

    const data = await res.json();

    data.forEach(s=>{

        system.innerHTML += `
        <option value="${s}">
            ${s}
        </option>`;

    });

};

/************************************************
SYSTEM CHANGE
************************************************/

system.onchange = async ()=>{

    type.innerHTML="<option>Select</option>";
    priority.value="";

    if(system.value=="") return;

    const res = await fetch(

        API+
        "?action=types&system="+
        encodeURIComponent(system.value)

    );

    const data = await res.json();

    data.forEach(t=>{

        type.innerHTML += `
        <option
        value="${t.type}"
        data-priority="${t.priority}">

        ${t.type}

        </option>`;

    });

};

/************************************************
TYPE CHANGE
************************************************/

type.onchange=()=>{

    const selected =
    type.options[type.selectedIndex];

    priority.value =
    selected.dataset.priority || "";

};

/************************************************
SUBMIT
************************************************/

submitBtn.onclick = async ()=>{

    if(category.value==""){

        alert("Select Category");
        return;

    }

    if(system.value==""){

        alert("Select System");
        return;

    }

    if(type.value==""){

        alert("Select Type");
        return;

    }

    if(locationBox.value.trim()==""){

        alert("Enter Location");
        return;

    }

    if(description.value.trim()==""){

        alert("Enter Description");
        return;

    }

    submitBtn.disabled=true;
    submitBtn.innerText="Submitting...";

    const body={

        action:"addComplaint",

        category:category.value,
        system:system.value,
        type:type.value,
        priority:priority.value,

        location:locationBox.value,
        description:description.value

    };

    const res = await fetch(API,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(body)

    });

    const result=await res.json();

    submitBtn.disabled=false;
    submitBtn.innerText="Submit Complaint";

    if(result.success){

        alert(
        "Complaint Registered\n"+
        result.id
        );

        category.selectedIndex=0;
        system.innerHTML="<option>Select</option>";
        type.innerHTML="<option>Select</option>";

        priority.value="";
        locationBox.value="";
        description.value="";

        loadTasks();

    }
    else{

        alert("Unable to submit.");

    }

};

/************************************************
LOAD TASKS
************************************************/

async function loadTasks(){

    const res =
    await fetch(API+"?action=tasks");

    const tasks =
    await res.json();

    taskContainer.innerHTML="";

    if(tasks.length===0){

        taskContainer.innerHTML=`
        <div class="task-card">

        <h3>No Pending Complaints</h3>

        </div>`;

        return;

    }

    tasks.reverse();

    tasks.forEach(c=>{

        taskContainer.innerHTML += `

<div class="task-card">

<h3>${c.id}</h3>

<p><span>Category :</span> ${c.category}</p>

<p><span>System :</span> ${c.system}</p>

<p><span>Type :</span> ${c.type}</p>

<p><span>Priority :</span> ${c.priority}</p>

<p><span>Location :</span> ${c.location}</p>

<p><span>Description :</span><br>
${c.description}</p>

<p><span>Date :</span> ${c.date}</p>

<p><span>Time :</span> ${c.time}</p>

<span class="status pending">

${c.status}

</span>

</div>

`;

    });

}

/************************************************
REFRESH
************************************************/

refreshBtn.onclick=()=>{

    loadTasks();

};