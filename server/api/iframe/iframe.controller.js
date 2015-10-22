'use strict';

var _ = require('lodash');
var request = require('request');

// Get list of iframes
exports.index = function(req, res) {
  function respuesta (dat){
    res.send(dat);
  }
  request('https://docs.google.com/document/d/11EawVdD5l2ZglEdqgSGO-Rm7I0QnDW1zZdRrkzkuERs/pub?embedded=true', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      respuesta(body);
      console.log(body); // Show the HTML for the Google homepage.
    }
  });

};
/*exports.getIframe = function (req, res) {
  var url = req.params.url;
  function respuesta (dat){
    res.send(dat);
  }
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      respuesta(body);
      console.log(body); // Show the HTML for the Google homepage.
    }
  });
};*/

function handleError(res, err) {
  return res.status(500).send(err);
}
