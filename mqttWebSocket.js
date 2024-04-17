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

let temperature = document.getElementById("temp");
let humidity = document.getElementById("humidity");
let soilMoisture = document.getElementById("soil-moisture");
let light = document.getElementById("light");

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';

    switch (message.destinationName) {
        case "tugay/temperature":
            temperature.textContent = message.payloadString;
            break;
        case "tugay/humidity":
            humidity.textContent = message.payloadString;
            break;
        case "tugay/soil_moisture":
            soilMoisture.textContent = message.payloadString;
            break;
        case "tugay/light":
            light.textContent = message.payloadString;
    }
    updateScroll(); // Scroll to bottom of window
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Unsubscribing to: ' + topic + '</span><br/>';
    temperature.textContent = "Temperature";
    humidity.textContent = "Humidity";
    soilMoisture.textContent = "Soil Moisture";
    light.textContent = "Light Intensity";
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}
