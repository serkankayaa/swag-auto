const fs = require('fs');
const yaml = require('js-yaml');

const { FileType } = require('./fileType');
const { checkEmpty } = require('./helper');
const YAML = require('yamljs');

const DEFAULT_TITLE = "My Swag API";
const DEFAULT_DESCRIPTION = "This api is generated by Swag Auto.";
const DEFAULT_TYPE = FileType.JSON;
const DEFAULT_FILE_NAME = './swagger';
const PATH_FILE_NAME = '/path';

var currentFileType;
var routeInfos = [];

function autoGen(title, description, type) {
  if (checkEmpty(title)) {
    title = DEFAULT_TITLE;
  }

  if (checkEmpty(description)) {
    description = DEFAULT_DESCRIPTION;
  }

  if (checkEmpty(type)) {
    type = DEFAULT_TYPE;
  }

  const path = DEFAULT_FILE_NAME + type;
  var rawdata;

  fileGenerator(type, path);

  if (fs.existsSync(path)) {
    rawdata = fs.readFileSync(path);
  }

  if (type == FileType.JSON) {
    genJsonFile(rawdata, path, title, description);
  }

  if (type == FileType.YAML) {
    genYamlFile(rawdata, path, title, description);
  }

  return path;
}

function fileGenerator(type, path) {
  checkEmpty(type);
  checkEmpty(path);

  try {
    if (!fs.existsSync(path)) {
      var copyableFile = fs.readFileSync(__dirname + "/swag" + type);
      checkEmpty(copyableFile);

      fs.writeFileSync("swagger" + type, copyableFile, function (err) {
        if (err) {
          throw err;
        }

        console.log("Swagger" + type + " succesfully created!");
      });
    }
  } catch (err) {
    console.error(err)
  }
}

function genJsonFile(data, path, title, description) {
  try {
    let swag = JSON.parse(data);
    swag.info.title = title;
    swag.info.description = description;
    fs.writeFileSync(path, JSON.stringify(swag));
  } catch (error) {
    console.log(error);
  }
}

function genYamlFile(data, path, title, description) {
  try {
    let fileContents = fs.readFileSync(path, 'utf8');
    let swag = yaml.safeLoad(fileContents);

    swag.info.title = title;
    swag.info.description = description;
    let yamlStr = yaml.safeDump(swag);
    fs.writeFileSync(path, yamlStr);

    return swag;

  } catch (e) {
    console.log(e);
  }
}

function swagConfig(title, description) {
  return {
    title: title,
    description: description
  }
}

function swagAuto(title, description, type) {
  if (type == FileType.JSON) {
    path = autoGen(title, description, type);
    checkSwagFile(FileType.JSON);

    return require("." + path);
  } else if (type == FileType.YAML) {
    autoGen(title, description, type);
    let yamlData = swaggerDocument = YAML.load(DEFAULT_FILE_NAME + type);
    checkSwagFile(FileType.YAML);

    return yamlData;
  }
}

function checkSwagFile(type) {
  currentFileType = type;

  return currentFileType;
}

function printRoutes(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(printRoutes.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(printRoutes.bind(null, path.concat(split(layer.regexp))))
  } else if (layer.method) {
    var route = path.concat(split(layer.regexp)).filter(Boolean);
    routeInfos.push({
      Method: layer.method.toLowerCase(),
      Route: route
    });

  }
}

function split(thing) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

function getRoutes(app) {
  app._router.stack.forEach(printRoutes.bind(null, []));

  if (currentFileType == FileType.YAML) {
    routeInfos.forEach(r => {
      let path = __dirname + PATH_FILE_NAME + FileType.YAML;
      let fileContents = fs.readFileSync(path, 'utf8');
      let swag = JSON.stringify(yaml.safeLoad(fileContents));

      swag = swag.replace("tmpPath", r.Route);
      swag = swag.replace("tmpMethod", r.Method);
      let yamlStr = yaml.safeDump(yaml.safeLoad(swag));

      fs.appendFile(DEFAULT_FILE_NAME + FileType.YAML, yamlStr, 'utf8',
        // callback function
        function (err) {
          if (err) throw err;
          // if no error
          console.log("Data is appended to file successfully.")
        });
    })
  }
}

module.exports = {
  autoGen,
  swagConfig,
  swagAuto,
  FileType,
  getRoutes
}