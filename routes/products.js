var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/marketplace';
//var url = 'mongodb://finders.ru:27017/marketplace';

router.get('/', function(req, res, next) {
	res.render('products');
});
router.post('/get-data', function(req, res, next) {
	var resultArray = [];
	var filter = req.body.filter || [];
	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		var skip = parseInt((filter.page - 1) * filter.itemsPerPage);
		var totalRecords = 0;
		var tmp = filter['sortField'];
		var filtering = filter.filter;
		var filterObj = {};
		filtering.forEach(function(elem, err){
			switch (elem.type){
				case "brand":
					let inArray = [];
					for (const brand of Object.keys(elem.values)) {
						if (elem.values[brand] === true){
							inArray.push(brand);
						}
					};
					if (inArray.length > 0) {
						filterObj["brand"] = { $in: inArray};
					}

					break;
				case "price":
					filterObj["price"] = { $gte: parseInt(elem.values.min), $lte: parseInt(elem.values.max) };
					break;
				default:
					break;
			}

		});
		var cursor = db.collection('product-data').find(filterObj).sort(filter.sortField).skip(skip).limit(parseInt(filter.itemsPerPage));
		db.collection('product-data').count(filterObj, function(error, numOfDocs){
			assert.equal(null, err);
			db.close();
			totalRecords = numOfDocs;
		});
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			resultArray.push(doc);
		}, function() {
			db.close();
			var responce = {
				"Success": true,
				"Data": {
					"currpage" : filter.page,
					"totalrecords" : totalRecords,
					"invdata" : resultArray
				},
				"Errors": []
			};
			res.send(responce);
		});
	});
});


router.get('/get-data/:id', function(req, res, next) {
	var resultArray = [];
	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		var cursor = db.collection('product-data').find();
		// cursor.forEach(function(doc, err){
		// 	assert.equal(null, err);
		// 	resultArray.push(doc);
		// }, function() {
		// 	db.close();
		// 	res.send(resultArray);
		// });
		res.send(db.collection('product-data').count());
	});
});



router.post('/insert', function(req, res, next) {

	mongo.connect(url, function (err,db) {
		assert.equal(null, err);
		db.collection('product-data').insertOne(items, function(err, result){
			assert.equal(null, err);
			res.send(items);
			db.close();
		});
	});

});

module.exports = router;
