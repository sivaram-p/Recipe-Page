function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const lastSubmission = props.getProperty("lastSubmissionTime");
  const now = Date.now();



  // controlled submission 1 submission per minute to prevent spamming


  if (lastSubmission && now - parseInt(lastSubmission) < 60000) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "Please wait before submitting again" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  props.setProperty("lastSubmissionTime", now.toString());

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RecipieDataBase");
  const folder = DriveApp.getFolderById("1re-ikzvXEn4X4Xyej1rzGRcVuz41lmOJ");



  // sanitize the  inputs code


  function sanitizeInput(input) {
    return input ? input.replace(/[<>]/g, "").slice(0, 1000) : "";
  }

  const name = sanitizeInput(e.parameter.name);
  const title = sanitizeInput(e.parameter.title);
  const description = sanitizeInput(e.parameter.description);
  const ingredients = sanitizeInput(e.parameter.ingredients);
  const utensils = sanitizeInput(e.parameter.utensils);
  const steps = sanitizeInput(e.parameter.steps);
  const serving = sanitizeInput(e.parameter.serving);
  const extras = sanitizeInput(e.parameter.extras);



  let imageUrl = "";



  //image upload code
  if (e.parameter.imageData && e.parameter.imageType && e.parameter.imageName) {
    try {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(e.parameter.imageData),
        e.parameter.imageType,
        e.parameter.imageName
      );
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = file.getUrl();
    } catch (err) {
      Logger.log("Image upload failed: " + err);
      return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "Image upload failed" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }



  //updating sheet block of code
  sheet.appendRow([
    new Date(), name, title, description, ingredients, utensils,
    steps, serving, extras, imageUrl
  ]);

  return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
