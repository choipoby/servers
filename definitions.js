// host
module.exports.SERVER_NAME = "tls.testserver.com";

// ports
module.exports.HTTP_PORT = 40000;
module.exports.RSA_HTTPS_PORT = 40001;
module.exports.ECC_HTTPS_PORT = 40003;
module.exports.ECC_HTTPS_PORT2 = 40004;
module.exports.NOT_LISTENING_PORT = 99999;
module.exports.IPV6_PORT = 40005;

// paths
module.exports.SOCKET_DESTROY_URI ="/destroy-request-socket";
module.exports.NO_RESPONSE_URI ="/no-response";
module.exports.TIMEOUT_URI ="/timeout";
module.exports.BIG_RESPONSE_HEADER="/big-response-header";
module.exports.MANY_SMALL_RESPONSE_HEADERS="/many-small-server-headers";
module.exports.BIG_RESPONSE_DATA="/big-response-data";
module.exports.NON_EXISTING_PATH="/safsgvsefaewfsdf";

module.exports.MAX_RANGE_REQUEST_SIZE = 1000000;
