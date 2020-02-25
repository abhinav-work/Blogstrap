const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const app = express();
const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin')
const authRoute = require('./routes/auth');
const path = require('path');
const errorController = require('./Controllers/error');
const isAuth = require('./Middleware/is_auth');
//const mongoConnect = require('./utilities/database').mongoConnect;
const User = require('./models/user');
const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://rocko:hashvalue@cluster0-shard-00-00-khltq.mongodb.net:27017,cluster0-shard-00-01-khltq.mongodb.net:27017,cluster0-shard-00-02-khltq.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

app.use(express.static(path.join(__dirname + '/Public')))
app.use('/images', express.static(path.join(__dirname + '/images')))

const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});
const csrfProtection = csurf();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().valueOf() + "-" + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).array('image', 3));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(session({
    secret: "my secret key",
    resave: false,
    saveUninitialized: false,
    store: store
}));




app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.isAdminLog = req.session.isMaster;
    next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {

            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err)
            next(new Error(err))
        });
})



app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use(shopRoute);
app.use('/admin', adminRoute);
app.use(authRoute);

app.use('/500', errorController.get500Error);
app.use(errorController.getError);

app.use((error, req, res, next) => {
    res.redirect('/500');
})

// mongoConnect( () => {
//     app.listen(port, () => console.log("Server is running HOT @" + port + " !!!!"));
// })

mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        app.listen(port);
        console.log("Connection to the Database established successfully");
    })
    .catch(err => console.log("Error in Connecting to DB" + err));