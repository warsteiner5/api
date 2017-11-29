var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/marketplace';
//var url = 'mongodb://0.0:27017/marketplace';

router.get('/', function(req, res, next) {
	res.render('filters');
});
router.get('/get-data', function(req, res, next) {
	var resultArray = [];
	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		var cursor = db.collection('filter-data').find();

		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			resultArray.push(doc);
		}, function() {
			db.close();
			var responce = {
				"Success": true,
				"Data": resultArray,
				"Errors": []
			};
			res.send(responce);
		});
	});
});

module.exports = router;
