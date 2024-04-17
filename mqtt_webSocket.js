// Called after form input is processed
function startConnect() {
    // Generate a random client ID
    clientID = "clientID-" + "Control Panel";

    // Fetch the hostname/IP address and port number from the form
    host = document.getElementById("host").value;
    port = document.getElementById("port").value;
    user = document.getElementById("username").value;
    pass = document.getElementById("password").value;

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';

    // Initialize new Paho client connection
    client = new Paho.Client(host, Number(port), clientID);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful - call onConnect function
    client.connect({
        onSuccess: onConnect,
        userName: user,
        password: pass
    });
}

// Called when the client connects
function onConnect() {

    // Fetch the MQTT topic from the form
    topic = document.getElementById("topic").value;

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';

    // Subscribe to the requested topic
    client.subscribe(topic);
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    console.log("onConnectionLost: Connection Lost");

    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';

    switch (message.destinationName) {
        case "tugay/temperature":
            document.getElementById("temp").innerHTML = message.payloadString;
            break;
        case "tugay/humidity":
            document.getElementById("humidity").innerHTML = message.payloadString;
            break;
        case "tugay/soil_moisture":
            document.getElementById("soil-moisture").innerHTML = message.payloadString;
            break;
        case "tugay/light":
            document.getElementById("light").innerHTML = message.payloadString;
    }
    updateScroll(); // Scroll to bottom of window
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}
