var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db){

	assert.equal(err, null)
	console.log("Successfully connected to MongoDB.")

	var query = {"permalink": {"$exists": true, "$ne": null}}
	var projection = {"permalink": 1, "updated_at": 1}

	var cursor = db.collection('companies').find(query)
	cursor.project(projection)
	cursor.sort({"permalink": 1})

	var markedForRemoval = []

	var previouse = {"permalink": "", "updated_at": ""}

	cursor.forEach(
		function(doc){
			if((doc.permalink == previouse.permalink) && (doc.updated_at == previouse.updated_at)){
				markedForRemoval.push(doc._id)
			}

			previouse = doc
		},
		function(err){
			assert.equal(err, null)

			var filter = {"_id": {"$in": markedForRemoval}}

			db.collection('companies'). deleteMany(filter, function(err, res){
				console.log(res.result)
				console.log(markedForRemoval.length + " documents remoived.")
				
				return db.close()
			})
			
		}
	)
})