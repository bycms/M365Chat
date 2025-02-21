const MarkdownIt = require('markdown-it');

const today = new Date();
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOfWeek = daysOfWeek[today.getDay()];
const date = today.toLocaleDateString('en-US');
console.log("Conversation on " + date + ", " + dayOfWeek)

let history = [];

document.getElementById('send').addEventListener('click', function(event) {
    event.preventDefault();
    
    const message = document.getElementById('user-input').value;
    newUserMessage(message);
    document.getElementById("sysProcess").style.display = "block"; console.log("Showed process.")
    document.getElementById("sysProcess").innerHTML = "Deciding what to do...";
    document.getElementById("user-input").value = "";

    const options = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer sk-tmyrvfoatzrzlmyfsvhbsvpplcoqfdscvnrogsbadkqkvqpf',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-V3",
            messages: [
                {
                    content: "You are an AI agent helping user with Microsoft 365 tasks. The current date is " + date + ", " + dayOfWeek + ". You can help users create basic tasks, retrieve user's tasks info and answer questions about them. DO NOT call the create task function when user are asking you about their tasks. Here's an array of user's tasks which might be empty, repetitive names are normal and you can see them as one task, combining their duedates: " + window.taskNames.length ? window.taskNames.join(",") : " "+ ". Here is your chat history: " + history.join(", "),
                    role: "system"
                },
                {
                    content: message,
                    role: "user"
                }
            ],
            stream: false,
            temperature: 0.7,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "add task item",
                        description: "Add To-Do task to user's account. Only call when the user specifies the need.",
                        parameters: {
                            "Task_Name": "Name of the to-do task. Capitalize all initials.",
                            "Start_Date": "Start date. 'null' if not specified, ISO 8601 format if given e.g. 2023-02-02T00:00:00Z",
                            "Due_Date": "Due date. 'null' if not specified, ISO 8601 format if given e.g. 2022-02-02T00:00:00Z"},
                        strict: true
                    }
                }
            ]
        })
    };
    
    fetch('https://api.siliconflow.cn/v1/chat/completions', options)
    .then(response => response.json())
    .then(response => {
        document.getElementById("sysProcess").innerHTML = "Loading response...";
        const message = response.choices[0]?.message;
        
        if (message?.tool_calls && message.tool_calls.length > 0) {
            // Extract function name and parameters if function calling is triggered
            const functionName = message.tool_calls[0].function.name;
            const parameters = JSON.parse(message.tool_calls[0].function.arguments);
            console.log('Function Name:', functionName);
            console.log('Parameters:', parameters);
            if (functionName == "add task item") {
                createTask(parameters.Task_Name, parameters.Start_Date, parameters.Due_Date);
            }
        } else {
            // If no function calling is triggered, print the normal response content
            console.log('Response Content:', message?.content || 'No content available');
            newAIMessage(message?.content);
            document.getElementById("sysProcess").style.display = "none";
        }
    })
    .catch(err => console.error(err));
});

function newAIMessage(msgContent) {
    let md = new MarkdownIt;
    let html = md.render(msgContent);

    const mainElement = document.getElementById('chatArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add("AIMessage");
    messageElement.innerHTML = html;
    mainElement.appendChild(messageElement);
    history.push(msgContent);
}

function newUserMessage(msgContent) {
    const mainElement = document.getElementById('chatArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add("userMessage");
    messageElement.textContent = msgContent;
    mainElement.appendChild(messageElement);
    history.push(msgContent);
}

function newSystemMessage(msgContent) {
    const mainElement = document.getElementById('chatArea');
    const messageElement = document.createElement('div');
    messageElement.classList.add("sysMessage");
    messageElement.textContent = msgContent;
    mainElement.appendChild(messageElement);
}

document.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") {
        document.getElementById("send").click();
    }
})

/************* Graph APIs *****************/
async function createTask(taskname, start, end) {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${window.firstTaskListId}/tasks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${window.accToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: taskname,
            dueDateTime: {
                dateTime: end,
                timeZone: "UTC"
            },
            startDateTime: {
                dateTime: start,
                timeZone: "UTC"
            }
          })
        });
        const data = await response.json();
        console.log(data);
        if (data.title == taskname) {
            newSystemMessage("✅ Created task.")
            newAIMessage(`I've created a task "${taskname}" in Microsoft ToDo for you.`)
        }
        else {

        }
      } catch (error) {
        console.error(error);
      }
}
