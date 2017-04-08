# mongo
### Create Commands
* db.dbCollectionName.insertOne({"title":"Some Title", "name":"Some Name"})
* db.dbCollectionName.insertMany(
	[
		{"title":"Some Title", "name":"Some Name"},
		{"title":"Some Title", "name":"Some Name"}
	],
	{"ordered":false})// if we want to keep giong even if errorrs accure

### Remove collection
* db.dbCollectionName.drop()

### Reading Operations
* db.dbCollectionName.find().pretty 
	// this will give all documents in collection

* db.dbCollectionName.find({rated: "PG-13"}) 
	// will return all documents with rating PG-13

* db.dbCollectionName.count() 
	// returns number indicating quantity of documets matching query

* db.dbCollectionName.find({rated: "PG-13", year: 2009})	
	// will return all documents with rating PG-13 and year 2009

* db.dbCollectionName.find({"tomato.meter":100}) 
	// use in searches in nested documents like 
	{
		"tomato":{
			"meter": 100,
			"rating": 9.3
		}
	}

* db.dbCollectionName.find({"writters":["Ethan Cohen", "Joel Cohen"]}) 
	// this type of query is for searching for exact match in the array under writters key - Important: ORDER MATTERS!!!

* db.dbCollectionName.find({"writters":"Ethan Cohen"}) 
	// wil return all documents whos writters array contains Ethan Cohen

* db.dbCollectionName.find({"writters.0":"Ethan Cohen"})
	// will return all documents where Ethan Cohen is first entry in writters array


### Cursors
* to access all the data returned by query we have to do the following
	- assign the cursor to a variable
	var c = db.dbCollectionName.find()

	- create a function to get next batch of data in particular query
	var doc = function(){ return c.hasNext() ? c.next() : null }

	- check the batch size in initial batch
	c.objsleftInBatch()

### Projection - use it if you want to return a certain filds in documents not all of them
* db.dbCollectionName.find({"writters":"Ethan Cohen"}, {"writters":1})
	// this will return all documents whose writters array contains Ethan Cohen BUT it will return only writters field and _id field!!!

* db.dbCollectionName.find({"writters":"Ethan Cohen"}, {"writters":0})
	// 0 will exclude this field to be returned 































