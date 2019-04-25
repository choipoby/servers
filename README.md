TEST setup

0. register your host name
sudo vi /etc/hosts
127.0.0.1       tls.testserver.com

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


how to use
```
curl https://tls.testserver.com:40000/test1
```
This will give you below error because it is a self signed certificat

```
curl: (35) error:140770FC:SSL routines:SSL23_GET_SERVER_HELLO:unknown protocol
schoi@lgud-schoi:~/GitHub/servers (master) curl https://tls.testserver.com:40003/test1
curl: (60) SSL certificate problem: self signed certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```
```
curl --insecure https://tls.testserver.com:40003/test1
```
```
this is simple test to show https is working
```