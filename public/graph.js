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
  scopes: ["User.Read", "Files.Read"]
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
      // Additional logic after sign-in can be added here.
    })
    .catch(error => {
      console.error("Login failed:", error);
    });
}

document.getElementById("sign-in").addEventListener("click", signIn);