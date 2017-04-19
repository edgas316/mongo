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

``` shell
db.collectionName.createIndex({"name": 1, "some_otehr_valie": -1})
```
> 1 stands for descending order -1 ascending order 



























