let kanbanPort = null;

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({enabled: false, roboticsLinks: []}, function() {
    console.log("Extension is disabled by default");
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "kanban") {
    kanbanPort = port;
    port.onDisconnect.addListener(function() {
      kanbanPort = null;
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "addLinks") {
    chrome.storage.sync.get('roboticsLinks', function(data) {
      let existingLinks = data.roboticsLinks || [];
      let newLinks = request.links.filter(newLink => 
        !existingLinks.some(existingLink => existingLink.url === newLink.url)
      );
      let updatedLinks = [...existingLinks, ...newLinks];
      chrome.storage.sync.set({roboticsLinks: updatedLinks}, function() {
        console.log("Updated links:", updatedLinks);
      });
    });
  } else if (request.action === "getLinks") {
    chrome.storage.sync.get('roboticsLinks', function(data) {
      console.log("Sending links to Kanban:", JSON.stringify(data.roboticsLinks, null, 2));
      sendResponse({links: data.roboticsLinks});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
