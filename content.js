let enabled = false;
let keywords = ['robotics', 'perception'];

chrome.storage.sync.get(['enabled', 'keywords'], function(data) {
  enabled = data.enabled;
  keywords = data.keywords || keywords;
  if (enabled) {
    findRoboticsJobs();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleExtension") {
    enabled = request.enabled;
    if (enabled) {
      findRoboticsJobs();
    } else {
      removeHighlights();
    }
  } else if (request.action === "updateKeywords") {
    keywords = request.keywords;
    if (enabled) {
      removeHighlights();
      findRoboticsJobs();
    }
  }
});

function findRoboticsJobs() {
  const links = document.querySelectorAll('a');
  const newLinks = [];
  links.forEach(link => {
    const linkText = link.textContent.trim().toLowerCase();
    const parentText = link.parentElement ? link.parentElement.textContent.trim().toLowerCase() : '';
    
    if (keywords.some(keyword => linkText.includes(keyword) || parentText.includes(keyword)) &&
        !isUnwantedLink(linkText)) {
      highlightElement(link);
      newLinks.push({text: link.textContent.trim(), url: link.href});
    }
  });
  
  if (newLinks.length > 0) {
    chrome.runtime.sendMessage({action: "addLinks", links: newLinks});
  }
}

function isUnwantedLink(text) {
  const unwantedPhrases = [
    'home page',
    'jobs powered by',
    'powered by'
  ];
  return unwantedPhrases.some(phrase => text.includes(phrase));
}

function highlightElement(element) {
  element.style.backgroundColor = 'yellow';
  element.style.fontWeight = 'bold';
  element.style.border = '2px solid orange';
  element.style.padding = '2px';
  element.style.fontSize = '1.1em';
  element.classList.add('robotics-highlight');
}

function removeHighlights() {
  const highlightedElements = document.querySelectorAll('.robotics-highlight');
  highlightedElements.forEach(element => {
    element.style.backgroundColor = '';
    element.style.fontWeight = '';
    element.style.border = '';
    element.style.padding = '';
    element.style.fontSize = '';
    element.classList.remove('robotics-highlight');
  });
}

// Add this function to periodically check for new jobs
function startJobCheck() {
  setInterval(findRoboticsJobs, 5000); // Check every 5 seconds
}

// Modify the existing code to start the periodic check
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (enabled) {
    findRoboticsJobs();
    startJobCheck();
  }
} else {
  document.addEventListener('DOMContentLoaded', function() {
    if (enabled) {
      findRoboticsJobs();
      startJobCheck();
    }
  });
}
