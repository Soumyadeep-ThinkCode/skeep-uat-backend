const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const app = express();

/**************** ROUTES CONFIGURED START *****************/
const user = require('./routes/user');
const referrer = require('./routes/referrer');
const seeker = require('./routes/seeker');
const company = require('./routes/company');
const review = require('./routes/review');
const request = require('./routes/request');
const jobrefer = require('./routes/jobrefer');
const seekRefer = require('./routes/seekrefer');
const utilities = require('./routes/utilities');
const discuss = require('./routes/discuss');
const country = require('./routes/country');
const message = require('./routes/message');
const department = require('./routes/department');
const industry = require('./routes/industry');
const options = require('./routes/options');
const boards = require('./routes/boards');
const applies = require('./routes/applies');
/**************** ROUTES CONFIGURED END *****************/

app.use(cors());
app.options('*', cors());

app.use(function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Expose-Headers', 'x-auth-token');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS');
	next();
});

app.use(express.json());
app.use(helmet());
app.use(compression());
app.use("/images", express.static(path.join("profile/images")));



if(!config.get('jwtPrivateKey')){
	process.exit(1);   //O is for Success and any other number eg - 1 is for Errors
}

const MONGODB_URI = "mongodb+srv://refbud-uat:Snehadeep90@cluster0.kgurz.mongodb.net/SkeepUATDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI || 'mongodb://localhost/skeepDevDB', {
	useNewUrlParser : true,
	useUnifiedTopology : true,
	useFindAndModify: false
});

mongoose.connection.on('connected', () => {
	console.log("Connected to the MongoDB.");  
});

app.use('/api/auth', user);
app.use('/api/referrers', referrer);
app.use('/api/seekers', seeker);
app.use('/api/company', company);
app.use('/api/review', review);
app.use('/api/request', request);
app.use('/api/jobrefer', jobrefer);
app.use('/api/seekRefer', seekRefer);
app.use('/api/utilities', utilities);
app.use('/api/discuss', discuss);
app.use('/api/country', country);
app.use('/api/message', message);
app.use('/api/department', department);
app.use('/api/industry', industry);
app.use('/api/options', options);
app.use('/api/boards', boards);
app.use('/api/applies', applies);

const port = process.env.PORT || 3000;

app.listen(port , function(){
    console.log(`Listening to port ${port} for skeep-backend`);
});
