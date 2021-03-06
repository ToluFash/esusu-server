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
| View all Groups | /groups/all| GET | N/A | {***groups} |N/A | False
| View Group Information | /groups/info| POST | {"username":"user","email":"email"} | {***group_info} | Passkey to be passed in authorization header. | True
| Invite Member to Group  | /groups/invite' | POST | {"name": "group_name","username": "user/admin","member": "user_to_invite"} | {"status": xxx,"inviteId": "*****"} | Passkey to be passed in authorization header, InviteId to be passed in ` Join Group by Invitation` UseCase | True
| Join Group  | /groups/join | POST | { "name": "group_name","username":"user"} | {"status": xxx} | Passkey to be passed in authorization header. | True
| Join Group by Invitation | /groups/invitations/join | POST | {"inviteId": "fbcddddf-1393-491c-b48c-a35428543e31"} | {"status": xxx} | Passkey to be passed in authorization header. | True

# Test API
Goto `https://esusu-server.herokuapp.com`