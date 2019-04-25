//Lets require/import necessary modules
var fs = require('fs');
var http = require('http');
var https = require('https');
var dispatcher = require('httpdispatcher');
var parseRange = require("range-parser");
var definitions = require("./definitions.js");

//--------------------------------------------------------------------------------
// DISPACHERS
//--------------------------------------------------------------------------------
dispatcher.onGet("/test1", function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain"});
    res.end("this is simple test to show https is working");
});

dispatcher.onGet("/big", function(req, res) {
        var v = fs.readFileSync("80kb.txt", "utf8");
    res.writeHead(200, { "Content-Type": "text/plain", "Content-Length": v.length});
    res.end(v);
});


dispatcher.onGet("/cert/rsa", function(req, res) {
    var cert = fs.readFileSync("tls.testserver.com.crt").toString("ascii");
    console.log(cert);
    res.writeHead(200, { "Content-Type": "text/plain", "Content-Length": cert.length });
    res.end(cert);
});

dispatcher.onGet("/cert/ecc", function(req, res) {
    var cert = fs.readFileSync("tls.testserver.com.ecc.crt.pem").toString("ascii");
    console.log(cert);
    res.writeHead(200, { "Content-Type": "text/plain", "Content-Length": cert.length });
    res.end(cert);
});

dispatcher.onGet("/redirect2http", function(req, res) {
    res.writeHead(
        302,
        { "Location": "http://tls.testserver.com:40000/test1" }
    );
    res.end("this is simple test to show https is working");
});

// See http://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js
dispatcher.onGet("/range-request", function (req, res) {
    res.setHeader("Accept-Ranges", "bytes");

    var range = parseRange(definitions.MAX_RANGE_REQUEST_SIZE, req.headers.range);
    console.log("range=" + JSON.stringify(range));

    if (range === -1 || range === -2) {
        res.writeHead(216);
        res.end();
        return;
    }

    var start = range[0].start;
    var end = range[0].end;

    var stat = fs.statSync("log.txt");

    if (start >= stat.size || end >= stat.size) {
        res.setHeader("Content-Range", "bytes */" + stat.size);
        res.writeHead(216);
        res.end();
    }
    else {
        res.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + stat.size);
        res.setHeader("Content-Length", (start == end) ? 0 : (end - start + 1));
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Cache-Control", "no-cache");
        res.writeHead(206);

        var readable = fs.createReadStream("log.txt", { start: start, end: end });
        readable.on("open", function () {
            console.info("piping?");
            var p = readable.pipe(res);
            p.on('end', function () { console.log("ending?"); res.end(); });
        });


    }

});

dispatcher.onGet(definitions.SOCKET_DESTROY_URI, function (req, res) {
    console.log("destroying socket");
    req.socket.destroy();
});

dispatcher.onGet(definitions.NO_RESPONSE_URI, function(req, res) {
    console.log("doing nothing................");
});

dispatcher.onGet(definitions.TIMEOUT_URI, function(req, res) {
    console.log("set timeout................");
    res.setTimeout(100); //set socket destroy timeout in 100ms.
    setTimeout(function () {
        // since we are trying to sen response after timeout, socket is already closed
        res.end("timeout"); // socket should be timed out
    }, 300);
});

dispatcher.onGet(definitions.BIG_RESPONSE_HEADER, function (req, res) {
    var v = fs.readFileSync("80kb.txt", "utf8");
    //var v = fs.readFileSync("x.txt", "utf8");
    res.writeHead(200, { "Content-Type": v });
    res.end("Big response header");
});

dispatcher.onGet(definitions.MANY_SMALL_RESPONSE_HEADERS, function (req, res) {
    for (var i = 0; i < 2000; i++) {
        res.setHeader("header-" + i, i);
    }
    res.end("Many small server headers");
    console.log("done sending a lot of small headers");
});

dispatcher.onGet(definitions.BIG_RESPONSE_DATA, function (req, res) {
    var v = fs.readFileSync("gzipped.txt", "utf8");
    res.writeHead(200, { "Content-Type": "text/javascript",
                         "Content-Length": v.length,
                         "Connection": "keep-alive",
                         "Content-Encoding": "gzip",
                         "Cache-Control": "max-age=600"});
    res.end(v);
    console.log("serving big response data");
});

//--------------------------------------------------------------------------------
// HTTP server handler
//--------------------------------------------------------------------------------
function handleHttpRequest(request, response){
    //console.log(request);
    try {
        //console.log("http://" + request.url);
        // dispatch
        dispatcher.dispatch(request, response);
    } catch (err) {
        console.log(err);
    }
}

//--------------------------------------------------------------------------------
// HTTPS server handler
//--------------------------------------------------------------------------------
function handleHttpsRequest(request, response) {
    console.log(request);
    try {
        console.log("https://" + request.url);
        // dispatch
        dispatcher.dispatch(request, response);
    } catch (err) {
        console.log(err);
    }
}

// --------------------------------------------------------------------------------------------- //
//Create a HTTP server and run
// --------------------------------------------------------------------------------------------- //
var httpServer = http.createServer(handleHttpRequest).listen(definitions.HTTP_PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", definitions.HTTP_PORT);
});

// --------------------------------------------------------------------------------------------- //
//Create a HTTPS server and run
// --------------------------------------------------------------------------------------------- //
// ----------------
// RSA cert setting
/*
var rsaOptions = {
    key: fs.readFileSync('tls.testserver.com.key.pem'),
    cert: fs.readFileSync('tls.testserver.com.crt.pem'),
};
var rsahttpsServer = https.createServer(rsaOptions, handleHttpsRequest).listen(definitions.RSA_HTTPS_PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("RSA Server listening on: https://localhost:%s", definitions.RSA_HTTPS_PORT);
});
*/

// ---------------------------------
// ECC cert with good cipher setting
var eccOptions = {
    key: fs.readFileSync('tls.testserver.com.ecc.key.pem'),
    cert: fs.readFileSync('tls.testserver.com.ecc.crt.pem'),
    //ciphers: "HIGH:!aNULL:!kRSA:!MD5:!RC4:!PSK:!SRP:!DSS:!DSA"
    ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384",
    //secureProtocol: "TLSv1_2_method"
};
//eccOptions.secureProtocol = "TLSv1_2_method";

var ecchttpsServer = https.createServer(eccOptions, handleHttpsRequest).listen(definitions.ECC_HTTPS_PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Good ECC Server listening on: https://localhost:%s", definitions.ECC_HTTPS_PORT);
});

/*
var ecchttpsServer2 = https.createServer(eccOptions, handleHttpsRequest).listen(definitions.ECC_HTTPS_PORT2, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Good ECC Server listening on: https://localhost:" + definitions.ECC_HTTPS_PORT2);
});
*/

// --------------------------------------------------------------------------------------------- //
// -- Create IPV6 https server --
// --------------------------------------------------------------------------------------------- //
/*
// if IP address get changed, this will throw an exception
var ipv6Address = "2607:fb10:16:200:d580:b7be:8b9b:d176";
var httpsServer2 = https.createServer(eccOptions, handleHttpsRequest).listen(definitions.IPV6_PORT, ipv6Address,  function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("ipv6 listening on: https://" + "[" + ipv6Address + "]" + ":" +  definitions.IPV6_PORT);;
});
*/
