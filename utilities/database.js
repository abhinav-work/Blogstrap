const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = callback => {
    MongoClient.connect('mongodb://rocko:nokiamini@cluster0-shard-00-00-iuhqo.mongodb.net:27017,cluster0-shard-00-01-iuhqo.mongodb.net:27017,cluster0-shard-00-02-iuhqo.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(client => {
            console.log("MongoDB connected successfully!!");
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log("Database connection error" + err);
            //throw err;
            });
};
 
const getDb = () => {
    if(_db)
    {
        return _db;
    }
    throw "No database found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;