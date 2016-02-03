var utils = require('./utils');

var objectId = 1;
var messages = [];

var actions = {
    'GET': function(request, response) {
        utils.sendResponse(response, {
            results: messages
        });
    },
    'POST': function(request, response) {
        utils.parsePost(request, function(message) {
            messages.push(message);
            message.objectId = ++objectId;
            utils.sendResponse(response, {objectId: objectId}, 201);
        });
    },
    'OPTIONS': function(request, response) {
        utils.sendResponse(response, null);
    }
};

 var requestHandler = function(request, response) {

    var action = actions[request.method];
    if (action) {
        action(request, response);
    } else {
        utils.sendResponse(response, "Not Found", 404);
    }
};

exports.requestHandler = requestHandler;