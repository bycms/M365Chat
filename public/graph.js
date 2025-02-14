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
    redirectUri: "https://bycms.github.io/M365Chat/public" // e.g., "http://localhost:3000"
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
      getTaskLists();
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
async function getTaskLists() {
  try {
    let taskNames = [];
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.accToken}`
      }
    });
    const data = await response.json();
    console.log(data?.value[0]?.id);
    window.firstTaskListId = data?.value[0]?.id;

    for (const urls of data?.value) {
      try {
        const res = await fetch(`https://graph.microsoft.com/v1.0/me/todo/lists/${urls.id}/tasks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${window.accToken}`
          }
        });
        const dat = await res.json();

        for (const tasks of dat?.value) {
          taskNames.push(`${tasks.title} Status: ${tasks.status} Starts From ${dateToStr(tasks.createdDateTime)} Ends At ${dateToStr(tasks.dueDateTime?.dateTime)} repeat ${tasks.recurrence?.pattern.type}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
    console.log(taskNames);
    window.taskNames = taskNames;
  } catch (error) {
    console.error(error);
  }
}

function dateToStr(timestamp) {
  let date = new Date(timestamp);

  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const formattedDateTime = `${month}/${day}/${year},${hours}:${minutes}`;

  return formattedDateTime;
}