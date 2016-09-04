/*
Version of hyperhost.js without the virtual engine. Simply makes requests to full hyperhosts.
Thomas Mullen 2016
*/

(function () {
    var rawViews;
    var initialized = false;
    var dataLoaded = false;

    document.addEventListener("DOMContentLoaded", initialize);
    window.addEventListener('hypermessage', handleHyperMessage);

    function initialize(event) {
        if (initialized) return;
        initialized = true;
        //Request resources
        var MY_ID = parseInt(Math.random() * 1e15, 10).toString(16);
        var PEER_SERVER = {
            host: "peerjs-server-tmullen.mybluemix.net",
            port: 443,
            path: "/server",
            secure: true
        };
        var peer = new Peer(MY_ID, PEER_SERVER); //Create the peer object
        var OTHER_ID = window.location.hash.substr(1); //Get the server's id from url

        peer.on('error', function (err) {
            console.error(err);
            if (!dataLoaded) {
                document.getElementById("HYPERHOST-HEADER").innerHTML = "Connection failed";
            }
        });

        console.log(OTHER_ID);
        var conn = peer.connect(OTHER_ID, {
            reliable: true
        });
        conn.on("data", function (data) {
            console.log("Data received, rendering page...");
            rawViews = data.rawViews;
            dataLoaded = true;
            document.getElementById("HYPERHOST-viewframe").style.display = "inherit";
            document.getElementById("HYPERHOST-dropzone").style.display = "none";
            HYPERHOST_NAVIGATE("index.html");
            conn.close();
        });
        conn.on("close", function () {
            console.log("Connection to host closed.");
            if (!dataLoaded) {
                document.getElementById("HYPERHOST-HEADER").innerHTML = "Connection failed";
            }
        });
    };

    //Send message to viewFrame document (across iframe)
    function message(data) {
        var childWindow = document.getElementById("HYPERHOST-viewframe").contentWindow;
        var event = new CustomEvent('hypermessage', {
            detail: data
        });
        childWindow.dispatchEvent(event);
    }

    //Listen to messages from viewFrame document (across iframe)
    function handleHyperMessage(e) {
        console.log(e);
        if (e.detail.type == "navigate") {
            HYPERHOST_NAVIGATE(e.detail.path);
        }
    }

    //Renders a different compiled HTML page in the viewframe
    function HYPERHOST_NAVIGATE(path) {
        for (var i = 0; i < rawViews.length; i++) {
            if (rawViews[i].path === path) {
                console.log(rawViews[i].body);
                document.getElementById("HYPERHOST-viewframe").srcdoc = rawViews[i].body;
                return;
            }
        }
        alert("HyperHost path '" + path + "' does not exist!");
    }

})();