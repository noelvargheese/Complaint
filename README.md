/*************************************************
 * Complaint & Task Management System V2
 * GitHub Pages Compatible
 *************************************************/

const ss = SpreadsheetApp.getActiveSpreadsheet();

const COMPLAINT = "Complaint";
const CATEGORY = "Category";
const SYSTEM = "System";
const TYPE = "Type";

/*************************************************
 * MAIN API
 *************************************************/

function doGet(e) {

  const action = (e.parameter.action || "").trim();

  try {

    switch (action) {

      case "categories":
        return json(getCategories());

      case "systems":
        return json(getSystems(e.parameter.category));

      case "types":
        return json(getTypes(e.parameter.system));

      case "priority":
        return json(getPriority(e.parameter.type));

      case "complaints":
        return json(getComplaints());

      case "tasks":
        return json(getTasks());

      case "addComplaint":
        return json(addComplaint(e));

      case "updateStatus":
        return json(updateStatus(e));

      case "assignTask":
        return json(assignTask(e));

      case "completeTask":
        return json(completeTask(e));

      default:
        return json({
          success:false,
          message:"Invalid Action"
        });

    }

  } catch(err){

    return json({
      success:false,
      error:String(err)
    });

  }

}

/*************************************************
 * JSON OUTPUT
 *************************************************/

function json(obj){

  return ContentService
  .createTextOutput(JSON.stringify(obj))
  .setMimeType(ContentService.MimeType.JSON);

}

/*************************************************
 * CATEGORY
 *************************************************/

function getCategories(){

  const sh=ss.getSheetByName(CATEGORY);

  if(sh.getLastRow()<2)
    return [];

  return sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      1
  ).getValues()
   .flat()
   .filter(String);

}

/*************************************************
 * SYSTEM
 *************************************************/

function getSystems(category){

  const sh=ss.getSheetByName(SYSTEM);

  if(sh.getLastRow()<2)
    return [];

  const values=sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      2
  ).getValues();

  return values
        .filter(r=>r[0]==category)
        .map(r=>r[1]);

}

/*************************************************
 * TYPE
 *************************************************/

function getTypes(system){

  const sh=ss.getSheetByName(TYPE);

  if(sh.getLastRow()<2)
    return [];

  const values=sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      3
  ).getValues();

  return values
      .filter(r=>r[0]==system)
      .map(r=>({

          type:r[1],
          priority:r[2]

      }));

}

/*************************************************
 * PRIORITY
 *************************************************/

function getPriority(type){

  const sh=ss.getSheetByName(TYPE);

  if(sh.getLastRow()<2){

    return{
      priority:""
    };

  }

  const values=sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      3
  ).getValues();

  const row=values.find(r=>r[1]==type);

  if(row){

    return{
      priority:row[2]
    };

  }

  return{
    priority:""
  };

}

/*************************************************
 * GENERATE ID
 *************************************************/

function generateID(){

  const sh=ss.getSheetByName(COMPLAINT);

  if(sh.getLastRow()<2)
    return "CMP0001";

  const ids=sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      1
  ).getValues()
   .flat();

  let max=0;

  ids.forEach(id=>{

      const n=parseInt(
          String(id).replace("CMP","")
      );

      if(n>max)
          max=n;

  });

  max++;

  return "CMP"+("0000"+max).slice(-4);

}
/*************************************************
 * ADD COMPLAINT
 *************************************************/

function addComplaint(e){

  const p = e.parameter;

  const sh = ss.getSheetByName(COMPLAINT);

  const now = new Date();

  const date = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
  );

  const time = Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "HH:mm"
  );

  const id = generateID();

  sh.appendRow([

      id,
      p.category,
      p.system,
      p.type,
      p.priority,
      p.location,
      p.description,
      "Pending",
      "",
      date,
      time

  ]);

  return{

      success:true,
      id:id

  };

}

/*************************************************
 * GET COMPLAINTS
 *************************************************/

function getComplaints(){

  const sh = ss.getSheetByName(COMPLAINT);

  if(sh.getLastRow()<2)
      return [];

  const values = sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      11
  ).getValues();

  return values.map(r=>({

      id:r[0],
      category:r[1],
      system:r[2],
      type:r[3],
      priority:r[4],
      location:r[5],
      description:r[6],
      status:r[7],
      assigned:r[8],
      date:r[9],
      time:r[10]

  }));

}

/*************************************************
 * GET PENDING TASKS
 *************************************************/

function getTasks(){

  return getComplaints().filter(c=>

      c.status!="Completed"

  );

}

/*************************************************
 * UPDATE STATUS
 *************************************************/

function updateStatus(e){

  const p = e.parameter;

  const sh = ss.getSheetByName(COMPLAINT);

  const ids = sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      1
  ).getValues();

  for(let i=0;i<ids.length;i++){

      if(ids[i][0]==p.id){

          sh.getRange(i+2,8)
            .setValue(p.status);

          return{

              success:true

          };

      }

  }

  return{

      success:false

  };

}

/*************************************************
 * ASSIGN TASK
 *************************************************/

function assignTask(e){

  const p = e.parameter;

  const sh = ss.getSheetByName(COMPLAINT);

  const ids = sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      1
  ).getValues();

  for(let i=0;i<ids.length;i++){

      if(ids[i][0]==p.id){

          sh.getRange(i+2,9)
            .setValue(p.assigned);

          return{

              success:true

          };

      }

  }

  return{

      success:false

  };

}

/*************************************************
 * COMPLETE TASK
 *************************************************/

function completeTask(e){

  const p = e.parameter;

  const sh = ss.getSheetByName(COMPLAINT);

  const ids = sh.getRange(
      2,
      1,
      sh.getLastRow()-1,
      1
  ).getValues();

  for(let i=0;i<ids.length;i++){

      if(ids[i][0]==p.id){

          sh.getRange(i+2,8)
            .setValue("Completed");

          return{

              success:true

          };

      }

  }

  return{

      success:false

  };

}
