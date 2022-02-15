# Esusu Server

Server for Esusu Application

# How to install 
1. Clone repo
2. Run `npm install`
3. Run `npm run server` to start server.

# How to use
Server is based on ExpressJS and MongoDB.
The following endpoints are made available on the API.

| Use Case  | Endpoint | Method | Request Body | Response |Notes |Auth Required |
| ------------- | ------------- | ------------- | ------------- |------------- |------------- |------------- |
| Homepage  | /  |GET  | N/A | Esusu Server | N/A | False
| Register  | /register | POST | {"username":"user","email":"email"} | {"status": xxx,"passkey": "*****"} | Passkey to be passed in authorization header in subsequent requests.| True
| Create Group  | /createGroup | POST | {"name":"name","description":"desc","username":"username","search":true,"capacity":50,"initialSavings": 300} | {"status": xxx} | Passkey to be passed in authorization header. | True
| View Group Information | /groups/info| POST | {"username":"user","email":"email"} | {"status": xxx,"passkey": "*****"} | Passkey to be passed in authorization header. | True
| Join Group  | /groups/join | POST | {"username":"user","email":"email"} | {"status": xxx,"passkey": "*****"} | Passkey to be passed in authorization header. | True
| Join Group by Invitation | /groups/invitations/join | POST | {"username":"user","email":"email"} | {"status": xxx,"passkey": "*****"} | Passkey to be passed in authorization header. | True
| Invite Member to Group  | /groups/invite' | POST | {"username":"user","email":"email"} | {"status": xxx,"passkey": "*****"} | Passkey to be passed in authorization header. | True
