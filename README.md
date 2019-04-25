TEST setup

1.file server setup for client app downloading

1.1. nodejs module install
sudo npm install http-server -g

1.2. run nodejs http file server
path/where/http-server$ http-server

==> then, you should be able to access from browser:
(you will see sub directories of where you run http-server

2. testing https server run
servers$ (master) nodejs simpleHttpServer.js

3. run client app
./netflix -U http://tls.testserver.com:8080/clientTestScript.js?test=test1
(scheme should be http:// in order to process query parameter correctly. if it is file://, somehow query parameters don't work)
