# mongo

## Create Commands

``` javascript
db.dbCollectionName.insertOne({"title":"Some Title", "name":"Some Name"})
db.dbCollectionName.insertMany(
 [
   {"title":"Some Title", "name":"Some Name"},
   {"title":"Some Title", "name":"Some Name"}
 ],
 {"ordered":false}
)// if we want to keep giong even if errorrs accure
```

## Remove collection

``` javascript
db.dbCollectionName.drop()
```

## Reading Operations

```javascript
db.dbCollectionName.find().pretty 
// this will give all documents in collection
```

```javascript
db.dbCollectionName.find({rated: "PG-13"}) 
// will return all documents with rating PG-13
```

```javascript
db.dbCollectionName.count() 
// returns number indicating quantity of documets matching query
```

```javascript
db.dbCollectionName.find({rated: "PG-13", year: 2009})	
// will return all documents with rating PG-13 and year 2009
```

```javacrpit
db.dbCollectionName.find({"tomato.meter":100}) 
// use in searches in nested documents like 
{
  "tomato":{
    "meter": 100,
    "rating": 9.3
  }
}
```

``` javascript
db.dbCollectionName.find({"writters":["Ethan Cohen", "Joel Cohen"]}) 
// this type of query is for searching for exact match in the array under writters key - Important: ORDER MATTERS!!!
```

``` javascript
db.dbCollectionName.find({"writters":"Ethan Cohen"}) 
// wil return all documents whos writters array contains Ethan Cohen
```

``` javascript
db.dbCollectionName.find({"writters.0":"Ethan Cohen"})
// will return all documents where Ethan Cohen is first entry in writters array
db.movieDetails.find({ "countries.1": "Sweden" })
// will return all documents where "Sweden" is second entry in countries array
```

### Cursors

* to access all the data returned by query we have to do the following

``` javascript

// assign the cursor to a variable
var c = db.dbCollectionName.find()

// create a function to get next batch of data in particular query
var doc = function(){ return c.hasNext() ? c.next() : null }

// check the batch size in initial batch
c.objsleftInBatch()
```

### Projection

* use it if you want to return a certain filds in documents not all of them

``` javascript
db.dbCollectionName.find({"writters":"Ethan Cohen"}, {"writters":1})
// this will return all documents whose writters array contains Ethan Cohen BUT it will return only writters field and _id field!!!
```

``` javascript
db.dbCollectionName.find({"writters":"Ethan Cohen"}, {"writters":0})
// 0 will exclude this field to be returned
```

``` javascript
db.dbCollectionName.find({"runtime": { $gte : 90, $lte: 120 }}).pretty()
// this will return all documents with "runtime" >= 90 && <=120 minutes

db.dbCollectionName.find({
  "tomato.meter": {$gte: 95},
  "runtime": {$gt: 90}
},
{
  title: 1,
  runtime: 1,
  _id: 0}
).pretty()
```

* Not equal

``` javascript
db.dbCollectionName.find({
  rated: {$ne: "UNRATED"}
},
{
  title: 1,
  runtime: 1,
  _id: 0}
).pretty()
```

* documents that contains...

``` javascript
db.dbCollectionName.find({
  rated: {$in: ["G", "PG"]}
}).pretty()
// this will return all douments whose rating is "G" or "PG"
```

``` javascript
db.dbCollectionName.find({ "tomato.meter":{$exists: true}})
// this will return all documents that has "tomato.meter" field at all

db.dbCollectionName.find({ "tomato.meter":{$exists: false}})
// this will return all documents that dosn't hav "tomato.meter" field at all
```

``` javascript
db.moviesScratch.find({"_id":{$type:"objectId"}}).pretty()
// this will rturn all documents whose _id datatype is "ObjectId"
```

* Logical Operators

``` javascript
db.dbCollectionName({
 $or: [
   {"tomato.meter": {$gte: 90}},
   {"metacritic": {$gte: 88}}
 ]
}).pretty()
/*
*  this will return all documents whose tomato.meter > 90 
*  or metacritic > 88
*/
```

``` javascript
db.dbCollectionName.find({
  $and:[
    {"tomato.meter": {$ne: null}},
    {"metacritic": {$exists: true}}
  ]
})

// this will return all documents whose tomato.meter !== null && contains metacritic field
```

### Array operators

``` javascript
// $all
db.dbCollectionName.find({
  genres: {$all: ["Comedy", "Crime", "Drama"]}
}).pretty()
// this will return all documents whos genres array contains these all three parameters

// $size
db.dbCollectionName.find({
  countries: {$size: 1}
}).pretty()
// this will return documents whose "countries" array size/length == 1

// $elemMatch
boxOffice: [ { "country": "USA", "revenue": 41.3 },
             { "country": "Australia", "revenue": 2.9 },
             { "country": "UK", "revenue": 10.1 },
             { "country": "Germany", "revenue": 4.3 },
             { "country": "France", "revenue": 3.5 } 
]

db.movieDetails.find({ boxOffice: { country: "UK", revenue: { $gt: 15 } } })
// this would return all documents whose boxOffice array contain country UK or revenue > 15 which is not what we want

db.movieDetails.find({ boxOffice: {$elemMatch: { country: "UK", revenue: { $gt: 15 } } } })
// this instead will return exact match of all documents whos boxOffice array matches given query, which is country is UK && revenue is > 15... which is exactly what we want
```

## Update Operations

``` javascript
// $set
// updateOne()
db.moviesScratch.updateOne({"title":"Rocky"}, {$set: {"comment":"This is good movie"}})
// this will find first document with title "Rocky" and add field "comment" if it not exists in the document or update its' value if the field exists it aslo checks if value is the same or not and if it is different only then update it
```

```javascript
// updateMany()
db.moviesScratch.updateMany({"title":"Rocky"}, {$set: {"comment":"This is good movie"}})
// this will find all documents with title "Rocky" and add field "comment" if it not exists in those documents or update theirs' value if the field exists it aslo checks if value is the same or not and if it is different only then update it

/**
Update command that will remove the "tomato.consensus" field for all documents matching the following criteria:
The number of imdb votes is less than 10,000
The year for the movie is between 2010 and 2013 inclusive
The tomato.consensus field is null
*/
db.movieDetails.updateMany({
  "year": {$gte: 2010, $lte: 2013},
  "imdb.votes": {$lt: 10000},
  $and: [
    {"tomato.consensus": {$exists: true} },
    {"tomato.consensus": null}
  ] },
  { $unset: { "tomato.consensus": "" } });
```

``` javascript
//$inc
// incriments integer value
db.moviesScratch.updateOne({"title":"Rocky"}, {$inc: {"review":4}})
// this finds document with title "Rocky" and increments its review by given number
```

``` javascript
// update array values
db.movieDetails.updateOne({title: "The Martian"},{$push: {
  reviews: {
    rating: 4.5,
    date: ISODate("2016-01-12T09:00:00Z"),
    reviewer: "Spencer H.",
    text: "The Martian could have been a sad drama film, instead it was a hilarious film with a little bit of drama added to it. The Martian is what everybody wants from a space adventure. Ridley Scott can still make great movies and this is one of his best."}}})
// this will add entry to reviews array if it exists or create an array and add entry to it if it doesn't exist
//side note - use ISODate("2016-01-12T09:00:00Z") for date data types...
```

``` javascript
// $push, $each
db.movieDetails.updateOne({ title: "The Martian" },{$push: { 
  reviews:{$each: [ { // we use $each to push lmultiple elements to the array
    rating: 0.5,
    date: ISODate("2016-01-13T07:00:00Z"),
    reviewer: "Shannon B.",
    text: "Enjoyed watching with my kids!" } ],
    $position: 0, // we use $position to push it to the head of the array
    $slice: 5 } } } ) // we use $slice to keep only the number of etries (in our case 5 entries) and delete the rest
```

``` javascript
// $unset
// this will find all documents that has "rated" as key and null as vallue and documents that don't have "rated" at all and remove "rated" field at all
db.movieDetails.updateMany( { rated: null },{ $unset: { rated: "" } } )
```

``` javascript
// upsert
var detail = {
    "title" : "The Martian",
    "year" : 2015,
    "rated" : "PG-13",
    "released" : ISODate("2015-10-02T04:00:00Z"),
    "runtime" : 144,
    "countries" : [
      "USA",
      "UK"
    ],
    "genres" : [
      "Adventure",
      "Drama",
      "Sci-Fi"
    ],
    "director" : "Ridley Scott",
    "writers" : [
      "Drew Goddard",
      "Andy Weir"
    ],
    "actors" : [
      "Matt Damon",
      "Jessica Chastain",
      "Kristen Wiig",
      "Jeff Daniels"
    ],
    "plot" : "During a manned mission to Mars, Astronaut Mark Watney is presumed dead after a fierce storm and left behind by his crew. But Watney has survived and finds himself stranded and alone on the hostile planet. With only meager supplies, he must draw upon his ingenuity, wit and spirit to subsist and find a way to signal to Earth that he is alive.",
    "poster" : "http://ia.media-imdb.com/images/M/MV5BMTc2MTQ3MDA1Nl5BMl5BanBnXkFtZTgwODA3OTI4NjE@._V1_SX300.jpg",
    "imdb" : {
      "id" : "tt3659388",
      "rating" : 8.2,
      "votes" : 187881
    },
    "tomato" : {
      "meter" : 93,
      "image" : "certified",
      "rating" : 7.9,
      "reviews" : 280,
      "fresh" : 261,
      "consensus" : "Smart, thrilling, and surprisingly funny, The Martian offers a faithful adaptation of the bestselling book that brings out the best in leading man Matt Damon and director Ridley Scott.",
      "userMeter" : 92,
      "userRating" : 4.3,
      "userReviews" : 104999
    },
    "metacritic" : 80,
    "awards" : {
      "wins" : 8,
      "nominations" : 14,
      "text" : "Nominated for 3 Golden Globes. Another 8 wins & 14 nominations."
    },
    "type" : "movie"
};
db.movieDetails.updateOne(
    {"imdb.id": detail.imdb.id},
    {$set: detail},
    {upsert: true});
// this will find document with imdb.id field matching to details.imdb.id and if finds such checks if values are the same if not then uptedes or adds them, also if document doesn't exist at all creates one


db.movies.replaceOne(
    {"imdb": detail.imdb.id},
    detail);
// this will find document with given id and replace its' data
```

## To start your mongo using Wired Tiger engin do the following
> create new directory where you will store your dbs and collections because WiredTiger can't read MMAP docs

``` shell
mkdir WT
mongod -dbpath WT -storageEngine -wiredTiger
```

> then you can create collectin and write document

``` shell 
db.foo.insert({"name": "Edwin"})
```

> check if engine is wiredTiger

``` shell
db.foo.stats()
```
## Indexes

> to create index on the collection use teh following command
> 1 stands for descending order -1 ascending order

``` shell
db.collectionName.createIndex({"name": 1, "some_otehr_valie": -1})
```
> to create index on array elements use following

``` shell
db.collection.createIndex({"studend.name": 1})
```

> to avoid writing duplicate data we can create unique index
> to create unique index use following command

``` shell
db.collection.createIndex({"student.name": 1}, {unique: true})
```

> suppose you have students collection with following documents structure:

``` javascript
{
  _id:8mqmx98xm92x42942,
  student_id: 0,
  scores: [
    {
      type: "exame",
      score: 88.9875776
    },
    {
      type: "quiz",
      score: 90.9875776
    },
    {
      type: "homework",
      score: 98.9875776
    }
  ],
  class_id: 230
}
```

> and you need to create index on scores 
> and then search all docs with scores higher 88.5 and with type exam

``` javascript
// create index
db.students.createIndex({"scores.score": 1})

// check indexes
db.students.getIndexes()

// run query with explanation
db.students.explain(true).find({"scores: {$elemMatch: {"type": "exam", score": {$gt: 88.5}}}})
// true in explain will give more information on how many documents was touched by this querty
```

> suppose you have following data structure and you need to create unique index

``` javascript
{a: 1, b: 2, c: 3}
{a: 4, b: 5, c: 6}
{a: 7, b: 8}
{a: 1, b: 2}
```
> if you try to create unique index on this collection it will errorout 
> because on the documents where there is no "c" key it will see c:null
> which means that these two documents has duplicate values
> so to solve this poblem and still create unique index you need to give it sparse option
> which will create unique id on the documents that contains "c" 
> and avoid the ones that don't have them

``` shell
db.collection.createIndex({c:1}, {unique: true, sparse: true})
```

> you can run index creation on foreground (by default) or on background
> foreground index creation block all other CRUD operations to the collection
> background index creation doesn't block any CRUD operations
> but you can run one index creation per collection at a time, others will be qued...

``` shell
db.collection.createIndex({"name": 1}, {background: true})
```

## explain verbosity
> to have more understanding of what mongodb does 
> when executing query we can use explain()

``` javascript
db.collection.explain().<operation>() // eg. find()
db.collection.explain(true).<operation>() // eg. find()
db.collection.explain("executionStats").<operation>() // eg. find()
db.collection.explain("allPlansExecution").<operation>() // eg. find()
```

## Covered queries

> covered queris are queries whre searched keys are indexed and projected
> ex. 

``` javascript
var arr = [
  {a: 1, b: 2, c: 3},
  {a: 4, b: 5, c: 6},
  {a: 7, b: 8, c: 9},
  {a: 10, b: 11, c: 12}
]
```

``` javascript
db.collection.createIndex({a:1, b:1, c:1})

// this query will search keys only without touching documents themself
// which makes it covered and much more effecient
db.collection.find({a:1, b:2}, {_id: 0, a: 1, b: 1})
```

## Geospatial Indexes

> find nearest document based on x,y coordinates

``` javascript
// suppose you have document with 'location' as x,y coordinates
'location': [70, 100] // longitude, latitude
db.collection.createIndex({location: '2d', type: 1})

// or if it is real maps geolocation use following
db.collection.createiIdex({'location': '2dsphere'})

// to find nearest docs you use following query
db.collection.find({'location': {$near: [67, 98]}}).limit(5)

// if geojson specs are used then query will look like this
db.collection.find){
  loc: {
    $near: {
      $geometry: {
        type: "Piont",
        coordinates: [-130, 39]
      },
      $maxDistance: 20000 // in meters
    }
  }
}
```

## Full Text Search Indexe

``` javascript
var doc = {
  _id: ObjectId(123948761234jhg12349871234jhg),
  words: 'dog tree ruby'
}
db.collection.createIndex({'words': 'text'}) // words is key from doc object text is type

// now query
// here you search by type 'text'
// and this will return all documents with indexed 'words' string with 'dog' in them
db.collection.find({$text: {$search: 'dog'}})

// to sort returned documents by best search match we use following query
db.collection.find({
  $text: {$search: 'dog tree obisidian'}}, {score: {$meta: 'textScore'}
}).sort({score: {$meta: 'textScore'}})
```
## Efficiency of index use

> if you have multiple indexes you may need to force Mongo to use the most effecient index

``` javascript
// to do that you will need to use this query
db.collection.find({student_id: {$gt: 500000}, class_id: 54}).sort({student_id: 1}).hint({class_id:1})
// by doing this you will force Mongo to retrieve documents based on theyr class_id index and not by student_id which is much more effecient...
```

> make your DB smarter you have to create right indexes especially when we talk about compaund indexes

``` javascript
// let's assume we have following query
db.students.find({student_id: {$tg: 500000}, class_id: 54}).sort({final_grade: 1}).hint({class_id: 1})

// with the following compaund index
db.students.createindex({class_id: 1, student_id: 1})

// this will return all matching documents and total keys examined will be equal to number returned, but it will do inmemory sort!!! which is nor really good
// to avoid this we will need to create smarter compaund index

db.students.createIndex({
  class_id: 1,    // equality field - this will elinate more than 90% of db
  final_grade: 1, // sort field     - this will walk trhough the db in order and will return sorted result set
  student_id: 1   // range field    - this will clear even more data returning only ones we need
})
// this will examine a very slitly more keys than return but it will perform sort in DB
```

> always check logs in mongod to determine slow queries

## Profiler

> system.profile has three options - 0 (which means off by default), 1 (which will log only slow qureries), 2 (which will log all queries, this one is more for general debugging purposes)

``` javascript
// "--profile 1" will tell mongod to log all slow queries "--slowms 2" means slower than 2 seconds
mongod -dbpath /usr/local/var/mongodb --profile 1 --slowms 2

// then if we want to see logs we need to run following query in mongo shell
db.system.profile.find().pretty()

// also we can use different type of queries
// "ns" stands for namespace in "test" db and "foo" collection, "ts" is timestamp
db.system.profile.find({ns:/test:foo/}).sort({ts:1}).pretty()

db.system.profile.find({millis: {$gt: 1000}}).sort({ts: 1}).pretty()

// this will printout the profiling level (eg. 0,1 or 2)
db.getProfileingLevel()

// this will show profiling status you've set up in mongod
db.getProfilingStatus()


// this will set profiling to level 1 and slower than 4 seconds
db.setProfilingLevel(1,4)

// to turn it off entirely 
db.setProfilingLevel(0)
``` 

## Mongotop

> mongotop will help you to see what your programm is doing and where mongo spending its time to identify slow queries

``` javascript
mongotop 3 
// this will run mongo check every 3 seconds and will check what mongo spending most of its' time
```

## Mongostat

> use "mongostat" to see whats ging on in your mongodb

## Sharding and replica set

> Sharding is a technic to split a large collection betwin multiple servers
> mongo will use "mongos" as router, your app will talk to mongos and mongos will talk to the servers
> to shard your collection you need to have shardkey
> all your CRUD queries should have shardkey in them otherwise mongos will broadcast query to all servers
___

## Agregation Framework

























