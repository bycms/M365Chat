document.getElementById('send').addEventListener('click', function(event) {
    event.preventDefault();
    
    const message = document.getElementById('user-input').value;
    newUserMessage(message);
    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer sk-tmyrvfoatzrzlmyfsvhbsvpplcoqfdscvnrogsbadkqkvqpf',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V3",
            messages: [{
                content: message,
                role: "user"
            }],
            stream: false,
            temperature: 0.7,
            tools: [{
                type: "function",
                function: {
                    name: "add task item",
                    description: "Add To-Do task to user's account.",
                    parameters: {
                        "Task_Name": "Name of the to-do task. Capitalize all initials.",
                        "Start_Date": "Starting date. '0/0/0' if not specified, mm/dd/yyyy if given e.g. 02/02/2022"},
                    strict: true
                }
            }]
        })
    };
    
    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
    .then(response => response.json())
    .then(response => {
        const message = response.choices[0]?.message;
        
        if (message?.tool_calls && message.tool_calls.length > 0) {
            // Extract function name and parameters if function calling is triggered
            const functionName = message.tool_calls[0].function.name;
            const parameters = JSON.parse(message.tool_calls[0].function.arguments);
            console.log('Function Name:', functionName);
            console.log('Parameters:', parameters);
        } else {
            // If no function calling is triggered, print the normal response content
            console.log('Response Content:', message?.content || 'No content available');
            newAIMessage(message?.content);
        }
    })
    .catch(err => console.error(err));
});

function newAIMessage(msgContent) {
    const mainElement = document.getElementById('main');
    const messageElement = document.createElement('div');
    messageElement.classList.add("AIMessage");
    messageElement.textContent = msgContent;
    mainElement.appendChild(messageElement);
}

function newUserMessage(msgContent) {
    const mainElement = document.getElementById('main');
    const messageElement = document.createElement('div');
    messageElement.classList.add("userMessage");
    messageElement.textContent = msgContent;
    mainElement.appendChild(messageElement);
}