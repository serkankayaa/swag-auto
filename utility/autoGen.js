const fs = require('fs');

function readFile(title, description) {
  const path = './swagger.json';
  let rawdata = fs.readFileSync(path);
  
  if(!rawdata) {
    fs.appendFile("swagger2.json", "{ abc: 5 }", function(err) {
      if(err) {
        console.log(err);
      }

      console.log("file succesfull created!");
    });
    
    return;
  }

  let swag = JSON.parse(rawdata);
  swag.info.title = title;
  swag.info.description = description;
  fs.writeFileSync(path, JSON.stringify(swag));

  console.log(swag);
}

function swagConfig(title, description) {
  return {
    title: title,
    description: description
  }
}

module.exports = {
  readFile,
  swagConfig
}