const MongoClient = require('mongodb').MongoClient;

const express = require("express")
const app = express()
const cors = require('cors');
const bcrypt = require('bcrypt');
const { v4: uuidv4 }= require("uuid");
const saltRounds = 10;

function includesMember(list, member){
    for(let x = 0; x < list.length; x++){
        if(list[0].user === member)
            return true;
    }
    return false;

}
MongoClient.connect('mongodb+srv://healthtracker:AhzwGrC3ntKFKEb1@cluster0.ag96i.mongodb.net/esusuDb?retryWrites=true&w=majority',
    async function (err, client) {
                if (err) return console.error(err);
                console.log('Connected to Database');
                const db = await client.db('esusuDb');

                /*
                Tables Init
                 */
                const users = await db.collection('users');
                const groups = await db.collection('groups');
                const invitations = await db.collection('invitations');

                // Load the middlewares
                app.use(express.static("public"))
                app.use(cors());
                app.use(express.json());

        app.get('/', function(req,res){
            res.send("Esusu Server");
        });
        await app.post('/register', (req, res) => {
            users.find({email: req.body.email.toLowerCase()}).count().then(
                count=>{
                    if(count > 0)
                        res.jsonp({status:500, message: "User already exists"});
                    else{
                        users.find({username: req.body.username.toLowerCase()}).count().then(
                            count=>{
                                if(count > 0)
                                    res.jsonp({status:500, message: "User already exists"});
                                else{
                                    req.body.username = req.body.username.toLowerCase();
                                    req.body.email = req.body.email.toLowerCase();
                                    bcrypt.hash(req.body.username+req.body.email, saltRounds, function(err, hash) {
                                        req.headers.authorization = hash;
                                        users.insertOne(req.body);
                                        res.jsonp({status:200, passkey: hash});
                                    });
                                }
                            }
                        ).catch();
                    }
                }
            ).catch();
        });

        app.post('/createGroup', (req, res) => {
            groups.find({name: new RegExp("^" +req.body.name+"$","i")}).count().then(
                count=>{
                    if(count > 0)
                        res.jsonp({status:500, message: "Group already exists"});
                    else{
                        users.find({username: new RegExp("^" +req.body.username+"$","i"), passkey: req.headers.authorization}).count().then(
                            count=>{
                                if(count === 0)
                                    res.jsonp({status:500, message: "Incorrect Credentials"});
                                else{
                                    let group = {}
                                    group.name = req.body.name;
                                    group.description = req.body.description;
                                    group.admin = req.body.username;
                                    group.initialSavings = req.body.initialSavings? req.body.initialSavings: 0;
                                    group.capacity = req.body.capacity;
                                    group.search = req.body.search ? req.body.search: false;
                                    group.members = [];
                                    groups.insertOne(group);
                                    res.jsonp({status:200});
                                }
                            }
                        ).catch();
                    }
                }
            ).catch();
        });

        app.get('/groups/all', function(req,res) {
            groups.find({search:true}).toArray().then(
                array => {
                    array = array.map((item)=>{
                        return {
                            name: item.name,
                            membersTotal : item.members.length,
                        }
                    })
                    res.send(array)
                });
        });
        app.post('/groups/info', function(req,res) {
            groups.find({name: req.body.name}).toArray().then(
                array => {
                    if(array[0]){
                    users.find({username: new RegExp("^" +req.body.username+"$","i"), passkey: req.headers.authorization}).toArray()
                        .then(
                            usersP=> {
                                if (usersP.length === 0 ||  req.body.username !== array[0].admin)
                                    res.jsonp({status: 500, message: "Incorrect Credentials"});
                                else{
                                    array = array.map((item)=>{
                                        return {
                                            name: item.name,
                                            members : item.members,
                                        }
                                    })
                                    res.send(array)
                                }

                            }

                            )
                }
                else{
                        res.jsonp({status: 500, message: "No group exists"});

                    }
                }
            );
        });

        app.post('/groups/join', (req, res) => {
            groups.find({name: new RegExp("^" +req.body.name+"$","i")}).toArray().then(
                array => {
                    if(array[0] && array[0].members.length + 1 <= array[0].capacity){
                        users.find({username: new RegExp("^" +req.body.username+"$","i"), passkey: req.headers.authorization}).count().then(
                            count=> {
                                if (count === 0)
                                    res.jsonp({status: 500, message: "Incorrect Credentials"});
                                else {
                                    if(!includesMember(array[0].members, req.body.username)){
                                        array[0].members.push({user: req.body.username, savings: array[0].initialSavings});
                                        groups.updateOne({name: array[0].name}, {$set: array[0]});
                                        res.jsonp({status:200});
                                    }
                                    else
                                    res.jsonp({status:200, message: "Already Registered"});
                                }
                            }
                        )
                    }
                    else{
                        res.jsonp({status:500, message: "Capacity Reached or no group Exists"});
                    }
                });
        });
        app.post('/groups/invitations/join', (req, res) => {
            invitations.find({inviteId: req.body.inviteId}).toArray().then(
                found => {
                    if(found.length === 0)
                        res.jsonp({status:500, message: "Invitation not Exists"});
                    else{
                        groups.find({name: new RegExp("^" +found[0].group+"$","i")}).toArray().then(
                            array => {
                                if(array[0] && array[0].members.length + 1 <= array[0].capacity){
                                    users.find({username: new RegExp("^" +found[0].member+"$","i"), passkey: req.headers.authorization}).count().then(
                                        count=> {
                                            if (count === 0)
                                                res.jsonp({status: 500, message: "Incorrect Credentials"});
                                            else {
                                                if(!includesMember(array[0].members, found[0].member)){
                                                    array[0].members.push({user: found[0].member, savings: array[0].initialSavings});
                                                    groups.updateOne({name: array[0].name}, {$set: array[0]});
                                                    invitations.deleteOne({inviteId: req.body.inviteId});
                                                    res.jsonp({status:200});
                                                }
                                                else
                                                    res.jsonp({status:200, message: "Already Registered"});
                                            }
                                        }
                                    )
                                }
                                else{
                                    res.jsonp({status:500, message: "Capacity Reached or no group Exists"});
                                }
                            });
                    }
                })




        });
        app.post('/groups/invite', function(req,res) {
            groups.find({name: req.body.name}).toArray().then(
                array => {
                    if(array[0]){
                        users.find({username: new RegExp("^" +req.body.username+"$","i"), passkey: req.headers.authorization}).toArray()
                            .then(
                                usersP=> {
                                    if (usersP.length === 0 ||  req.body.username !== array[0].admin)
                                        res.jsonp({status: 500, message: "Incorrect Credentials"});
                                    else{
                                        users.find({username: new RegExp("^" +req.body.member+"$","i")}).toArray()
                                            .then(
                                                usersPP=> {
                                                    if (usersPP.length === 0)
                                                        res.jsonp({status: 500, message: "No User Exists"});
                                                    else{
                                                        let inviteId = uuidv4();
                                                        let invitation = {
                                                            inviteId: inviteId,
                                                            group: array[0].name,
                                                            member: req.body.member
                                                        }
                                                        invitations.insertOne(invitation);
                                                        res.send({status: 200, inviteId: inviteId})
                                                    }
                                                })

                                    }

                                }

                            )
                    }
                    else{
                        res.jsonp({status: 500, message: "No group exists"});

                    }
                }
            );
        });


            // start the server listening for requests
        app.listen(process.env.PORT || 3000,
            () => console.log("Server is running..."));


});