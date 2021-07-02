//EXPRESS

const express = require('express');
const app = express();

//PORT

const port = process.env.PORT||3000;

//BODY-PARSER

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


//DOT-ENV

require('dotenv').config();


//MONGODB

const mongoDb = require('mongodb');
const mongoClient = mongoDb.MongoClient;
const db_url = process.env.DB_URL;

//CORS
const cors = require('cors')
app.use(cors())
//HOME

app.get('/',function(req,res){
res.send('server for register app started')
})
//GET DATA
app.get('/getData', async function(req,res){
   
 try{

   let clientInfo= await mongoClient.connect(db_url);
   let db = clientInfo.db('registerUser')

    let result = await db.collection('entryList').find().toArray();
    console.log('DATA SENT');
     res.send(result)
 }
 catch(error){
     console.log('error',error);
 }

})


//POST DATA 

app.post('/sendData',async function(req,res){
    try{
        //INITIALIZING DATA
        let fName = req.body.fName;
        let mobile2 = req.body.mobile2;

        let jobType = req.body.jobType;

        let preferredLocation = req.body.preferredLocation;

        let profilePic = req.body.profilePic;

        let email = req.body.email;

        let date = req.body.date;
         
        let data ={
            fName,
            mobile2,
            jobType,
            preferredLocation,
            profilePic,
            email,
            date
        }
       
        //CONNECTING TO DB

     let clientInfo = await mongoClient.connect(db_url);
     let db = clientInfo.db('registerUser');
       
       //CHECK FOR USER ALREADY EXISTED

        let userExisted = await db.collection('entryList').find({$and:[{email},{date}]}).toArray();
        console.log(userExisted);
        if(userExisted.length){
            //UPDATING DATA
            
             await db.collection('entryList').updateOne({email},{$set:{ fName,
                mobile2,
                jobType,
                preferredLocation,
                profilePic,
                email,
                date}})

               console.log('FILE UPDATED');
        }

        else{
            //INSERTING DATA 
           db.collection('entryList').insertOne(data,function(err,success){
                if(err){
                    console.log('error inserting data');
                }
                console.log('FILE ENTERED');
            })
        }

        clientInfo.close()
        res.redirect('https://userregister.netlify.app/')
       


    }
    catch(error){
        console.log('error connecting DB',error);
    }

})

//DELETE

app.post('/delete', async function(req,res){


    try{
        let {email,date} =req.body 
        let data=[email,date]
        //CONNECTING DATABASE
        let clientInfo = await mongoClient.connect(db_url);
        let db = clientInfo.db('registerUser')
        
        //DELETING
          try{
            await db.collection('entryList').deleteOne({$and:[{email},{date}]})
         clientInfo.close()
         console.log('deleted successfully');
        res.status(200).send('Deleted successfully')
          }
          catch(error){
            console.log('cannot be deleted');
        res.status(400).send('Deletion Failure')
          }
      
    }
    catch(error){
     console.log('error',error);
    }
 

})



//APP LISTENER

app.listen(port,function(){
    console.log(`Server started at PORT ${port}`);
})
