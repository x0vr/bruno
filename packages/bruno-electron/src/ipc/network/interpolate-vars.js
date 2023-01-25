const Mustache = require('mustache');
const { each } = require('lodash');

// override the default escape function to prevent escaping
Mustache.escape = function (value) {
  return value;
};

const interpolateVars = (request, environment) => {
  if(!environment) {
    return request;
  }

  const variables = environment.variables;
  if(!variables || !variables.length) {
    return request;
  }
  
  const envVars = {};
  each(variables, (variable) => {
    envVars[variable.name] = Mustache.escape(variable.value);
  });

  const interpolate = (str) => {
    if(!str || !str.length || typeof str !== "string") {
      return str;
    }

    return Mustache.render(str, envVars);
  };

  request.url = interpolate(request.url);

  each(request.headers, (header) => {
    header.value = interpolate(header.value);
  });
  each(request.params, (param) => {
    param.value = interpolate(param.value);
  });

  // Todo: Make interpolation work with body mode json
  switch (request.body.mode) {
    case 'text': {
      request.body.text = interpolate(request.body.text);
      break;
    }
    case 'xml': {
      request.body.text = interpolate(request.body.text);
      break;
    }
    case 'multipartForm': {
      each(request.body.multipartForm, (param) => {
        param.value = interpolate(param.value);
      });
      break;
    }
    case 'formUrlEncoded': {
      each(request.body.formUrlEncoded, (param) => {
        param.value = interpolate(param.value);
      });
      break;
    }
  }

  return request;
};

module.exports = interpolateVars;
