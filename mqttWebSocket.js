let isConnected = false;

// Called after form input is processed
function startConnect() {

    if (isConnected) {
        onConnect();
    } else {
        // Fetch the hostname/IP address and port number from the form
        let host = document.getElementById("host").value;
        let port = document.getElementById("port").value;
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;

        fetch('users.json')
            .then(response => response.json())
            .then(data => {
                if (data.username === username && data.password === password) {
                    // Generate a random client ID
                    clientID = "clientID-" + "Control Panel";
                    // Print output for the user in the messages div
                    if (subscribedTopics.length < 1 && host !== "" && port !== "") {
                        document.getElementById("messages").innerHTML += '<span>Authentication successful</span><br/>'
                        document.getElementById("messages").innerHTML += '<span>Connecting to: ' + host + ' on port: ' + port + '</span><br/>';
                    }
                    // Initialize new Paho client connection
                    client = new Paho.Client(host, Number(port), clientID);

                    // Set callback handlers
                    client.onConnectionLost = onConnectionLost;
                    client.onMessageArrived = onMessageArrived;

                    // Connect the client, if successful - call onConnect function
                    client.connect({
                        onSuccess: onConnect
                    });
                    isConnected = true;

                } else {
                    document.getElementById("username").value = "";
                    document.getElementById("password").value = "";
                    document.getElementById("messages").innerHTML += '<span>Authentication unsuccessful. Please try again!</span><br/>';
                }
                updateScroll(); // Scroll to bottom of window
            });
    }
}

let subscribedTopics = [];
let topic;

// Called when the client connects
function onConnect() {

    // Fetch the MQTT topic from the form
    topic = document.getElementById("topic").value;

    // Print output for the user in the messages div
    if (isConnected && topic !== "" && !subscribedTopics.includes(topic)) {
        document.getElementById("messages").innerHTML += '<span>Subscribing to: ' + topic + '</span><br/>';
    }
    let options = document.getElementById("dynamic-select");
    // Subscribe to the requested topic
    if (topic !== "" && !subscribedTopics.includes(topic)) {
        client.subscribe(topic);
        subscribedTopics.push(topic);
        let newOption = new Option(topic, topic)
        newOption.id = "option-" + topic.split("tugay/")[1];
        options.appendChild(newOption);
    }
    if (isConnected) {
        document.getElementById("topic").value = "";
    }
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
    let selectElement = document.getElementById("dynamic-select");
    let selectedOption = selectElement.value;
    let topicOption = document.getElementById("option-" + selectedOption.split("tugay/")[1]);
    let topicToDisconnect = topicOption.value;
    client.unsubscribe(topicToDisconnect);
    subscribedTopics.splice(subscribedTopics.indexOf(topicToDisconnect), 1);
    selectElement.removeChild(topicOption);

    if (topicToDisconnect.includes("#")) {
        client.disconnect();
        temperature.textContent = "Temperature";
        humidity.textContent = "Humidity";
        soilMoisture.textContent = "Soil Moisture";
        light.textContent = "Light Intensity";
        subscribedTopics = [];
        isConnected = false;
    } else if (topicToDisconnect.includes("light")) {
        light.textContent = "Light Intensity";
    } else if (topicToDisconnect.includes("temperature")) {
        temperature.textContent = "Temperature";
    } else if (topicToDisconnect.includes("humidity")) {
        humidity.textContent = "Humidity";
    } else if (topicToDisconnect.includes("soil")) {
        soilMoisture.textContent = "Soil Moisture";
    }
    document.getElementById("messages").innerHTML += '<span>Unsubscribing to: ' + topicToDisconnect + '</span><br/>';

    if (subscribedTopics.length < 1) {
        document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/><br/>';
        isConnected = false;
    }
    if (!isConnected) {
        document.getElementById("host").value = "";
        document.getElementById("port").value = "";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }
    selectElement.selectedIndex = 0;
    updateScroll(); // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}