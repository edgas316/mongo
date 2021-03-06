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

## Aggregation Framework
> the aggregation framework is a set of analitics tools within mongodb that allows you to run varios types reports or analises on documents on one or more mongodb collections
> it is based on concept of pipeline - the idea is we take input from mongodb collection and pass the documents from that collection threough one or more stages each of which performs different operations on its' inputs.
> so it is Collection -> Stages -> Output
> Even if your data/documents are storred in the shape not very suitable for your application you can use aggregation framework to reshape returned documents in a form wuitable to your application

### Creating agregation pipeline

``` javascript
/* 
  the pipeline represented by array as a pipeline of objects as stages
  in this example we have pipeline with several stages
  we have stage for match and stage for project
*/
db.collection.aggregate([
  {$match: {founded_year: 2004}}, // stage one   - filtering
  {$sort: {name: 1}},             // stage two   - sorting
  {$skip: 10},                    // stage three - skipping first 10
  {$limit: 5},                    // stage four  - limiting the output to 5 documents
  {$project: {                    // stage five  - projecting output
    _id: 0,
    name: 1,
    founded_year: 1
  }}
])
```

### Project stage in aggregation framework pipeline
> promote nested fields

``` javascript
db.companies.aggregate([
  {$match: {"funding_rounds.investments.financial_org.permalink": "graylock"}},
  {$project: {
    _id: 0,
    name: 1,
    ipo: "$ipo.pub_year", // $ inside "" tells mongo to give the value that is in "ipo.pub_year"
    valuation: "$ipo.valuation_amount",
    funders: "$funding_rounds.investments.financial_org.permalink"
  }}
]).pretty()
```

> create nested fields

``` javascript
db.companies.aggregate([
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$project: {
    _id: 0,
    foudned: {
      year: "$founded_year",
      month: "$founded_month",
      day: "$founded_day"
    }
  }}
]).pretty()
```

> $unwind - will run on array and produce an output document for each one of the array values 

``` javascript
// so if we have document that looks like this 
{
  company: faceBook,
  fundingRound: [2000, 2001, 2003]
}

// after unwind will produce 
{
  {
    company: faceBook,
    fundingRound: 2000
  },
  {
    company: faceBook,
    fundingRound: 2001
  },
  {
    company: faceBook,
    fundingRound: 2003
  }
}

db.companies.aggregate([
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$unwind: "$funding_rounds"},
  {$project: {
    _id: 0,
    name: 1,
    funder: "$funding_rounds.investments.financial_org.permalink",
    amoung: "$funding_rounds.raised_amount",
    year: "$funding_rounds.funded_year"
  }}
])

// this query will produce all documents that has 'graylock' in array of funding rounds 
// but if we want to filter out only fnuding rounds where 'graylock' was investor,
// then we need to $unwind first and them match
db.companies.aggregate([
  {$unwind: "$funding_rounds"},
  {$unwind: "$funding_rounds.investors"},
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$project: {
    _id: 0,
    name: 1,
    funder: "$funding_rounds.investments.financial_org.permalink",
    amoung: "$funding_rounds.raised_amount",
    year: "$funding_rounds.funded_year"
  }}
])
// but this two $unwind operation will run through all collection...
// so to prevent this we will add one more $match into pipieline
db.companies.aggregate([
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$unwind: "$funding_rounds"},
  {$unwind: "$funding_rounds.investors"},
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$project: {
    _id: 0,
    name: 1,
    funder: "$funding_rounds.investments.financial_org.permalink",
    amoung: "$funding_rounds.raised_amount",
    year: "$funding_rounds.funded_year"
  }}
])

// so you can include multiple stages of the same type
```

### array expressions

> $filter

``` javascript
db.companies.aggregate([
  {$match: {"$funding_rounds.investments.financial_org.permalink": "greylock"}},
  {$unwind: "$funding_rounds"},
  {$unwind: "$funding_rounds.investors"},
  {$project: {
    _id: 0,
    name: 1,
    founded_year: 1,
    rounds: { $filter: {
      input: "$funding_rounds",
      as: "round", // we are creating variable here "round"
      cond: {$gte: ["$$round.rased_amount", 10000000]} // condition
    }}
  }},
  {$match: {"rounds.investments.financial_org.permalink": "greylock"}}
]).pretty()
```

> $arrayElementAt

``` javascript
db.companies.aggregate([
  {$match: {"founded_year": 2010}},
  {$project: {
    _id: 0,
    name: 1,
    foudned_year: 1,
    first_round: {$arrayElementAt: ["$funding_rounds", 0]}, // first element of array
    last_round: {$arrayElementAt: ["$funding_rounds", -1]}  // last element ot array
  }}
]).pretty()
```

> $slice

``` javascript
db.companies.aggregate([
  {$match: {"founded_year": 2010}},
  {$project: {
    _id: 0,
    name: 1,
    foudned_year: 1,
    early_rounds: {$slice: ["$founded_rounds", 1, 3]} // skipp the first one give me the next 3
  }}
])

// as well we can do what we did with $arrayElemetAt but this time with "$slice" 
db.companies.aggregate([
  {$match: {"founded_year": 2010}},
  {$project: {
    _id: 0,
    name: 1,
    foudned_year: 1,
    first_round: {$slice: ["$funding_rounds", 0]}, // first element of array
    last_round: {$slice: ["$funding_rounds", -1]}  // last element ot array
  }}
]).pretty()
```

> $size

``` javascript
db.companies.aggregate([
  {$match: {"founded_year": 2010}},
  {$project: {
    _id: 0,
    name: 1,
    foudned_year: 1,
    total_rounds: {$size: "$founded_rounds"}
  }}
])
```

### Accumulators

> $max accumulator

``` javascript
db.companies.aggregate([
  {$match: {"funding_rounds": {$exists: true, $ne: []}}},
  {$project: {
    _id: 0,
    name: 1,
    largest_round: {$max: "$founding_rounds.raised_ammount"}
  }}
])
// this will return documents and project only 
```

> $sum accumulator

``` javascript
db.companies.aggregate([
  {$match: {"funding_rounds": {$exists: true, $ne: []}}},
  {$project: {
    _id: 0,
    name: 1,
    largest_round: {$sum: "$founding_rounds.raised_ammount"}
  }}
])
// this will calculate total funding in collection
```

### $group

``` javascript
db.companies.aggregate([
  {$group: {
    _id: {founded_year: "$founded_year"},
    average_number_of_employees: {$avg: "$number_of_employees"}
  }},
  {$sort: {average_number_of_employees: -1}}
])

//===
db.companies.aggregate([
  {$match: {"relationships.person": {$ne: null}}},
  {$project: {relationships: 1, _id: 0}},
  {$unwind: "$relationships"},
  {$group: {
    _id: "$relationships.person",
    count: {$sum: 1}
  }},
  {$sort: {count: -1}}

  //===
  db.companies.aggregate([
    {$group: {
      _id: {ipo_year: "$ipo.pub_year"},
      companies: {$push: "$name"}
    }},
    {$sort: {"_id.ipo_year":1}}
  ])
]).pretty()
```

### $group vs $project

``` javascript
db.companies.aggregate([
  {$match: {funding_rounds: {$exists: true, $ne: []}}},
  {$unwind: "$funding_rounds"},
  {$sort: {
    "funding_rounds.funded_year": 1,
    "funding_rounds.funded_month": 1,
    "funding_rounds.funded_day": 1
    }
  },
  {$group: {
    _id: {conpany: "$name"},
    first_round: {$first: "$funding_rounds"},
    last_round: {$last: "$funding_rounds"},
    num_rounds: {$sum: 1},
    total_raised: {$sum: "$funding_rounds.raised_ammount"}
  }},
  {$project: {
    company: "$_id.company",
    first_round: {
      amount: "$first_round.raised_ammount",
      article: "$first_round.source_url",
      year: "$first_round.founded_year"
    },
    last_round: {
      amount: "$last_round.raised_ammount".
      article: "$last_round.source_url",
      year: "$last_round.foudned_year"
    },
    num_rounds: 1,
    total_raised: 1
  }},
  {$sort: {total_raised: -1}}
]).pretty()


//aggregation query that will determine the number of unique companies with which an individual has been associated.
db.companies.aggregate([
  { $project: { relationships: 1, _id: 0, name : 1, permalink: 1 } },
  { $unwind: "$relationships" },
  { $group: {
      _id: { person: "$relationships.person" },
      gross_companies: { $push : "$permalink" },
      unique_companies: { $addToSet : "$permalink" }
  } },
  { $project: {
      _id: 0,
      person: "$_id.person",
      gross_companies: 1,
      unique_companies: 1,
      unique_number_of_companies: { $size: "$unique_companies" },
      gross_number_of_companies: { $size: "$gross_companies" }
  } },
  { $sort: { unique_number_of_companies: -1 } }
]).pretty()


// one more example using aggregation
// document before aggregation
{
    "_id" : ObjectId("50b59cd75bed76f46522c392"),
    "student_id" : 10,
    "class_id" : 5,
    "scores" : [
        {
            "type" : "exam",
            "score" : 69.17634380939022
        },
        {
            "type" : "quiz",
            "score" : 61.20182926719762
        },
        {
            "type" : "homework",
            "score" : 73.3293624199466
        },
        {
            "type" : "homework",
            "score" : 15.206314042622903
        },
        {
            "type" : "homework",
            "score" : 36.75297723087603
        },
        {
            "type" : "homework",
            "score" : 64.42913107330241
        }
    ]
}

// aggregation query
db.grades.aggregate( [
{ $unwind : "$scores" },
{ $match : { "scores.type" : { $ne : "quiz" } } },
{ $group : { 
  _id : { student_id : "$student_id", class_id : "$class_id" }, 
  avg : { $avg : "$scores.score" } } 
},
{ $group : { 
  _id : "$_id.class_id", 
  avg : { $avg : "$avg" } } 
},
{ $sort : { "avg" : -1 } },
{ $limit : 5 } ] )

// document after aggregation
{
  "waitedMS": NumberLong("0"),
  "result": [
    {
      "_id": 1,
      "avg": 64.50642324269175
    },
    {
      "_id": 5,
      "avg": 58.084487676135495
    },
    {
      "_id": 20,
      "avg": 57.6309834548989
    },
    {
      "_id": 26,
      "avg": 56.06918278769094
    },
    {
      "_id": 9,
      "avg": 55.56861693456625
    }
  ],
  "ok": 1
}


//For companies in our collection founded in 2004 and having 5 or more rounds of funding, calculate the average amount raised in each round of funding. Which company meeting these criteria raised the smallest average amount of money per funding round?

db.companies.aggregate([
    { $match: { founded_year: 2004 } },
    { $project: {
        _id: 0,
        name: 1,
        funding_rounds: 1,
        num_rounds: { $size: "$funding_rounds" }
    } },
    { $match: { num_rounds: { $gte: 5 } } },
    { $project: {
        name: 1,
        avg_round: { $avg: "$funding_rounds.raised_amount" }
    } },
    { $sort: { avg_round: 1 } }
]).pretty()
```

## Application Engineering 

### Replication 
> write concerns - is when data is written to memory but not yet to the disc, and if, for some reason, your server goes down/crashes you will loose your data...
> to eliminate that you want to set w (stands for write) and j (stands for jurnal) settings wich are by default w=1 and j=false, set j=true, in this case your write operations will be much slower but you will be sure that your data is written to disc...
> also you might have some network errors - let say your write was successfull but because network error accured you received error and now you don't know if data was written or not, and the real problem with this when performing update operations. So the recommendation is to use create() operation instead...

### Replica Set
> Minimum replica set nodes quantity = 3
> Type of replica set nodes: 
* Regular - can be primery or secondary
* Arbitrar - for voting 
* Delayed - usually it is a disaster recovery node, it might be 1 or 2 hour behind other nodes, it can participate in voting but it can't become a primery node, so its' Priority is set to 0, P=0
* Hidden - often used for analitics, it can participate in voting but it can't become a primery node, and not visible by app, so its' Priority is set to 0, P=0

> run replica set on one machine use following command

``` shell
#!/usr/bin/env bash

mkdir -p /data/rs1 /data/rs2 /data/rs3
mongod --replSet m101 --logpath "1.log" --dbpath /data/rs1 --port 27017 --oplogSize 64 --smallfiles --fork 
mongod --replSet m101 --logpath "2.log" --dbpath /data/rs2 --port 27018 --oplogSize 64 --smallfiles --fork
mongod --replSet m101 --logpath "3.log" --dbpath /data/rs3 --port 27019 --oplogSize 64 --smallfiles --fork
```
> to see the status of replica nodes wether it is primary or secondary use following in mongo shell 

``` shell 
rs.status()
```

> to connect those three mongod instances into replica set create init_replica.js file with following script

``` javascript
config = { _id: "m101", members:[
          { _id : 0, host : "localhost:27017"}, // or host:"Edvins-MacBook-Pro.local:30002"
          { _id : 1, host : "localhost:27018"},
          { _id : 2, host : "localhost:27019"} ]
};

rs.initiate(config);
rs.status();
```
> then run 

``` shell
mongo < init_replica.js
or
mongo --port 27017 < init_replica.js
```

> to connect to any of those instances use following 

``` shell
mongo --port 27017
```

> to query secondary node use following command

``` shell
rs.slaveOk()
```

> to fidn what is running on the machine

``` shell
ps -ef | grep mongod
```

> to stop the server run this in mongo shell

``` shell
db.adminCommand({shutdown: 1, force: trueg})
```

> Replication supports mixed-mode storage engine. For example mmapv1 primary and wiredTiger secondary 

### Connecting to replica set from Node.js driver

> first you have to go over previos steps to be sure you have your replica set up and running and config file is properly runed as well
> you also can go over those steps manually (not recommended)

> run three instances of mongod on different hosts as

``` shell
mongod --port 30001 --replSet m101 --dbpath /data/rs1
mongod --port 30002 --replSet m101 --dbpath /data/rs2
mongod --port 30003 --replSet m101 --dbpath /data/rs3
```

> then run mongoshell with following commands

``` shell 
mongo localhost:30001
rs.initiate()
rs.add("Edvins-MacBook-Pro.local:30002")
rs.add("Edvins-MacBook-Pro.local:30003")
rs.status()
'''

> write concerns in driver
> if you set w=1 will wait primery to acknoledge the write
> if w=2 will wait for the primery and one secondary to acknoledge the write and etc.

## Sharding
> whey you have sharded environment you don't connect to replica anymore, rather you connect to 'mongos' and 'mongos' connects to the shard/replica set. 





