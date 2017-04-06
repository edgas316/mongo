# mongo
## Create Commands
* db.dbName.insertOne({"title":"Some Title", "name":"Some Name"})
* db.dbName.insertMany(
	[
		{"title":"Some Title", "name":"Some Name"},
		{"title":"Some Title", "name":"Some Name"}
	],
	{"ordered":false})// if we want to keep giong even if errorrs accure