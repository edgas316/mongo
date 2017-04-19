var MongoClient = require('mongodb'),
    commandLineArgs = require('command-line-args'),
    assert = require('assert');

var options = commandLineOptions()

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db){

    assert.equal(err, null)
    console.log("Successfully connected to MongoDB.")

    var query = queryDocument(options)
    var projection = {
        "_id": 1, 
        "name": 1, 
        "founded_year": 1,
        "number_of_employees": 1, 
        "crunchbase_url": 1,
        "offices.country_code": 1,
        "offices.description": 1,
        "ipo.valuation_amount": 1
    };

    var cursor = db.collection('companies').find(query, projection)
    cursor.sort([["founded_year", 1], ["number_of_employees", -1]])
    cursor.skip(options.skip)
    cursor.limit(options.limit)
    // "sort", "skip", "limit" alwais runs in this order even if you ch
    var numMatches = 0

    cursor.forEach(
        function(doc) {
            numMatches += 1;
            console.log(doc)
        },
    function(err){
        assert.equal(err, null)
        console.log("Our query was: " + JSON.stringify(query))
        console.log("Matching Documents: " + numMatches)
        return db.close()
    });
});

function queryDocument(options){
    console.log(options)

    var query = {
        "founded_year": {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        }
    }
    if("employees" in options){
        query.number_of_employees = {"$gte": options.employees}
    }
    if("ipo" in options){
        if(options.ipo == "yes"){
            query["ipo.valuation_amount"] = {"$exists": true, "$ne": null}
        }else if(options.ipo == "no"){
            query["ipo.valuation_amount"] = null
        }
    }

    if("country" in options){
        query["offices.country_code"] = options.country
    }

    return query
}

function commandLineOptions(){
    var cli = commandLineArgs([
        {name: "firstYear", alias: "f", type: Number},
        {name: "lastYear", alias: "l", type: Number},
        {name: "employees", alias: "e", type: Number},
        {name: "ipo", alias: "i", type: String},
        {name: "country", alias: "c", type: String},
        {name: "skip", type: Number, defaultValue: 0},
        {name: "limit", type: Number, defaultValue: 20000}
    ])

    var options = cli.parse()
    if(!(("firstYear" in options) && ("lastYear" in options))){
        console.log(cli.getUsage({
            title: "Usage",
            discription: "The first two options below are required. the rest is optional"
        }))
        process.exit()
    }
    return options
}