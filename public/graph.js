const msalConfig = {
  auth: {
    clientId: "367ae86e-7485-4e72-b0b3-d43392a4a16d", // e.g., "12345678-abcd-efgh-ijkl-1234567890ab"
    authority: "https://login.microsoftonline.com/cfaf56ef-ac06-42ea-9eb1-7b91c55d65af", // Change if using a tenant-specific authority
    redirectUri: "http://localhost:3000" // e.g., "http://localhost:3000"
  },
  cache: {
    cacheLocation: "localStorage", // "sessionStorage" is also available
    storeAuthStateInCookie: true,   // Set to true if issues on IE11 or Edge
  }
};

// Define the scopes for accessing the Graph API.
const graphRequest = {
  // Include Files.Read for OneDrive file access.
  scopes: ["User.Read", "Files.Read", "Tasks.Read", "Tasks.ReadWrite"]
};

const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: "367ae86e-7485-4e72-b0b3-d43392a4a16d", // e.g., "12345678-abcd-efgh-ijkl-1234567890ab"
    authority: "https://login.microsoftonline.com/cfaf56ef-ac06-42ea-9eb1-7b91c55d65af", // Change if using a tenant-specific authority
    redirectUri: "http://localhost:3000" // e.g., "http://localhost:3000"
  },
  cache: {
    cacheLocation: "localStorage", // "sessionStorage" is also available
    storeAuthStateInCookie: true,   // Set to true if issues on IE11 or Edge
  }
});

window.accToken;
window.isSignedIn = false;

function signIn() {
  const loginRequest = {
    scopes: graphRequest.scopes,
  };

  msalInstance.loginPopup(loginRequest)
    .then(loginResponse => {
      console.log("Login successful:", loginResponse);
      window.accToken = loginResponse.accessToken;
      window.isSignedIn = true;
      getUserName().then(userName => {
        document.getElementById("sign-in").textContent = `Signed in as ${userName}`;
      });
      document.getElementById("sign-in").disabled = "true";
      getFirstTaskList();
      // Additional logic after sign-in can be added here.
    })
    .catch(error => {
      console.error("Login failed:", error);
    });
}

async function getUserName() {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.accToken}`
      }
    });
    const data = await response.json();
    console.log(data);
    return data?.displayName || null;
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("sign-in").addEventListener("click", signIn);

/************** Below are Graph API functions used in chats. **************/
async function getFirstTaskList() {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.accToken}`
      }
    });
    const data = await response.json();
    console.log(data?.value[0]?.id);
    window.firstTaskListId = data?.value[0]?.id;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllTasks() {
  const taskListsEndpoint = 'https://graph.microsoft.com/v1.0/me/todo/lists';
  const options = {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${window.accessToken}`,
          'Content-Type': 'application/json'
      }
  };

  try {
      // Fetch all task lists
      const taskListsResponse = await fetch(taskListsEndpoint, options);
      if (!taskListsResponse.ok) {
          throw new Error(`Error fetching task lists: ${taskListsResponse.statusText}`);
      }
      const taskListsData = await taskListsResponse.json();
      const taskLists = taskListsData.value;

      // Fetch tasks from each task list
      const allTasks = [];
      for (const list of taskLists) {
          const tasksEndpoint = `https://graph.microsoft.com/v1.0/me/todo/lists/${list.id}/tasks`;
          const tasksResponse = await fetch(tasksEndpoint, options);
          if (!tasksResponse.ok) {
              throw new Error(`Error fetching tasks from list ${list.id}: ${tasksResponse.statusText}`);
          }
          const tasksData = await tasksResponse.json();
          allTasks.push(...tasksData.value);
      }

      console.log(allTasks); // Array of all tasks from all lists
  } catch (error) {
      console.error(error);
  }
}