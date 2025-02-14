const msalConfig = {
    auth: {
      clientId: "367ae86e-7485-4e72-b0b3-d43392a4a16d", // e.g., "12345678-abcd-efgh-ijkl-1234567890ab"
      authority: "https://login.microsoftonline.com/cfaf56ef-ac06-42ea-9eb1-7b91c55d65af", // Change if using a tenant-specific authority
      redirectUri: "https://bycms.github.io/M365Chat/public" // e.g., "http://localhost:3000"
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

msalInstance.handleRedirectPromise().then((response) => {
  if (response) {
      console.log("Access Token:", response.accessToken);

  }
}).catch(error => {
  console.error(error);
});
