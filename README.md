/*************************************************
 * Complaint & Task Management API
 * Google Apps Script
 *************************************************/

const ss = SpreadsheetApp.getActiveSpreadsheet();

const COMPLAINT_SHEET = "Complaint";
const CATEGORY_SHEET = "Category";
const SYSTEM_SHEET = "System";
const TYPE_SHEET = "Type";

/*************************************************
 * MAIN API
 *************************************************/

function doGet(e) {

  const action = (e.parameter.action || "").trim();

  try {

    switch (action) {

      case "categories":
        return output(getCategories());

      case "systems":
        return output(getSystems(e.parameter.category));

      case "types":
        return output(getTypes(e.parameter.system));

      case "priority":
        return output(getPriority(e.parameter.type));

      case "complaints":
        return output(getComplaints());

      case "tasks":
        return output(getPendingTasks());

      default:
        return output({
          success: false,
          message: "Invalid Action"
        });

    }

  } catch(err){

    return output({
      success:false,
      error:String(err)
    });

  }

}

function doPost(e){

  try{

    const data = JSON.parse(e.postData.contents);

    switch(data.action){

      case "addComplaint":
        return output(addComplaint(data));

      case "updateStatus":
        return output(updateStatus(data));

      case "assignTask":
        return output(assignTask(data));

      case "completeTask":
        return output(completeTask(data));

      default:
        return output({
          success:false,
          message:"Invalid Action"
        });

    }

  }catch(err){

    return output({
      success:false,
      error:String(err)
    });

  }

}

/*************************************************
 * JSON OUTPUT
 *************************************************/

function output(obj){

  return ContentService
  .createTextOutput(JSON.stringify(obj))
  .setMimeType(ContentService.MimeType.JSON);

}

/*************************************************
 * CATEGORY
 *************************************************/

function getCategories(){

  const sh=ss.getSheetByName(CATEGORY_SHEET);

  const values=sh.getRange(2,1,sh.getLastRow()-1,1).getValues();

  return values
        .flat()
        .filter(String);

}

/*************************************************
 * SYSTEM
 *************************************************/

function getSystems(category){

  const sh=ss.getSheetByName(SYSTEM_SHEET);

  const values=sh.getRange(2,1,sh.getLastRow()-1,2).getValues();

  return values
    .filter(r=>r[0]==category)
    .map(r=>r[1]);

}

/*************************************************
 * TYPE
 *************************************************/

function getTypes(system){

  const sh=ss.getSheetByName(TYPE_SHEET);

  const values=sh.getRange(2,1,sh.getLastRow()-1,3).getValues();

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

  const sh=ss.getSheetByName(TYPE_SHEET);

  const values=sh.getRange(2,1,sh.getLastRow()-1,3).getValues();

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
 * GENERATE COMPLAINT ID
 *************************************************/

function generateComplaintID(){

  const sh=ss.getSheetByName(COMPLAINT_SHEET);

  const last=sh.getLastRow();

  if(last<2){

    return "CMP0001";

  }

  const id=sh.getRange(last,1).getValue();

  const num=parseInt(id.replace("CMP",""))+1;

  return "CMP"+Utilities.formatString("%04d",num);

}