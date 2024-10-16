document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const keywordsInput = document.getElementById('keywordsInput');
  const updateKeywordsButton = document.getElementById('updateKeywordsButton');
  const kanbanLink = document.getElementById('kanbanLink');
  const clearAllButton = document.getElementById('clearAllButton');

  function loadKeywords() {
    chrome.storage.sync.get('keywords', function(data) {
      keywordsInput.value = data.keywords ? data.keywords.join(', ') : 'robotics, perception';
    });
  }

  function updateToggleButton(enabled) {
    toggleButton.textContent = enabled ? 'Disable Extension' : 'Enable Extension';
    toggleButton.classList.toggle('disabled', !enabled);
  }

  chrome.storage.sync.get(['enabled', 'keywords'], function(data) {
    updateToggleButton(data.enabled);
    loadKeywords();
  });

  toggleButton.addEventListener('click', function() {
    chrome.storage.sync.get('enabled', function(data) {
      const newState = !data.enabled;
      chrome.storage.sync.set({enabled: newState}, function() {
        updateToggleButton(newState);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "toggleExtension", enabled: newState});
        });
      });
    });
  });

  updateKeywordsButton.addEventListener('click', function() {
    const keywords = keywordsInput.value.split(',').map(keyword => keyword.trim().toLowerCase());
    chrome.storage.sync.set({keywords: keywords}, function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "updateKeywords", keywords: keywords});
      });
    });
  });

  kanbanLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: chrome.runtime.getURL('kanban.html')});
  });

  clearAllButton.addEventListener('click', function() {
    chrome.storage.sync.set({roboticsLinks: []}, function() {
      console.log("Cleared all saved jobs");
    });
  });

  loadKeywords();
});
