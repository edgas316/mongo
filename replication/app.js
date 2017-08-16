var MongoClient = require('mongodb').MongoClient;
mongodb://server:port/db?replicaSet=name
MongoClient.connect("mongodb://localhost:30001,localhost:30002,localhost:30003/nodeDriver?replicaSet=m101", function(err, db) {
    if (err) throw err;

    db.collection("repl").insert({ 'x' : 1 }, function(err, doc) {
        if (err) throw err;

        db.collection("repl").findOne({ 'x' : 1 }, function(err, doc) {
            if (err) throw err;

            console.log(doc);
            db.close();
        });
    });
});
