/*
Copyright 2019 Shreyans Jain

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*
This sample chrome extension is to demonstrate how can build AI powered apps that can be used 
to check what you post on social media. This is sample code and shoul be modified to make it 
production ready.
*/

// Add your EINSTEIN BASE URL here. It should take take 1 query param text
// EG: https://example.com/api/sentiment/predict?text="analyze%20me"

const EINSTEIN_API_BASE_URL = "YOUR_URL_HERE";
const EINSTEIN_BUTTON_STYLE = `
.einstein-logo {
    background-color: Transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
}
`;
const GREEN_BACKGROUND_COLOR = "#4bb543";
const YELLOW_BACKGROUND_COLOR = "#eed202";
const RED_BACKGROUND_COLOR = "#cc0000";
const WHITE_FOREGROUND_COLOR = "#fff";
const BLACK_FOREGROUND_COLOR = "#000";
const ANALYZED_MESSAGE_CLASSNAME = "analyzed-message";
const DRAFT_EDITOR_CLASSNAME = "DraftEditor-root";
const POSITIVE_PREDICTION = "positive";
const NEGATIVE_PREDICTION = "negative";
const NEUTRAL_PREDICTION = "neutral";
const POSITIVE_MESSAGES = [
  "👍Great job! You are spreading a positive message.",
  "Nice Tweet! 💯",
  "I ❤️ this tweet."
];
const NEGATIVE_MESSAGES = [
  " Are you sure you want to tweet this? Maybe let's take a ☕ break ?",
  " That sounds rough! 👎 Do you want to tone down a bit ?",
  " 🙀 Are you really that upset ? 🙀",
  " ⚠️ You don't mean to tweet this. Right ? ⚠️ ",
  " 🛑This tweet sounds very mean. Are you sure you want to tweet ? 🛑"
];
const NEUTRAL_MESSAGES = [
  " 😐Do you wish to make this tweet a bit more positive ? 😐 ",
  " I think this tweet can be improved to make it more positive 🤔. What do you think ?"
];

const einsteinLogoButton = document.createElement("button");
const einsteinImage = document.createElement("img");
const styleSheet = document.createElement("style");

einsteinImage.src = chrome.runtime.getURL("analyze.png");
einsteinLogoButton.classList = ["einstein-logo"];
einsteinLogoButton.appendChild(einsteinImage);
styleSheet.type = "text/css";
styleSheet.innerText = EINSTEIN_BUTTON_STYLE;
document.head.appendChild(styleSheet);

function getRandomMessage(messageList) {
  return messageList[Math.floor(Math.random() * messageList.length)];
}

function handleTweetResponse(predictionData) {
  const prediction = predictionData.prediction;
  const POSITIVE_MESSAGE = getRandomMessage(POSITIVE_MESSAGES);
  const NEGATIVE_MESSAGE = getRandomMessage(NEGATIVE_MESSAGES);
  const NEUTRAL_MESSAGE = getRandomMessage(NEUTRAL_MESSAGES);
  if (prediction) {
    if (prediction === POSITIVE_PREDICTION)
      provideFeedback(
        GREEN_BACKGROUND_COLOR,
        WHITE_FOREGROUND_COLOR,
        POSITIVE_MESSAGE
      );
    if (prediction === NEGATIVE_PREDICTION)
      provideFeedback(
        RED_BACKGROUND_COLOR,
        WHITE_FOREGROUND_COLOR,
        NEGATIVE_MESSAGE
      );
    if (prediction === NEUTRAL_PREDICTION)
      provideFeedback(
        YELLOW_BACKGROUND_COLOR,
        BLACK_FOREGROUND_COLOR,
        NEUTRAL_MESSAGE
      );
  }
}

function provideFeedback(backgroundColor, textColor, messageText) {
  clearOldMessage();
  const messageNode = document.createElement("span");
  const message = document.createTextNode(messageText);
  const headerElement = document.getElementsByTagName("h2")[1];
  const editorElement = document.getElementsByClassName(
    DRAFT_EDITOR_CLASSNAME
  )[0];
  messageNode.className = ANALYZED_MESSAGE_CLASSNAME;
  messageNode.appendChild(message);
  editorElement.parentElement.parentElement.style.color = textColor;
  editorElement.parentElement.parentElement.style.background = backgroundColor;
  headerElement.parentNode.appendChild(messageNode);
}

function clearOldMessage() {
  const messageElements = document.getElementsByClassName(
    ANALYZED_MESSAGE_CLASSNAME
  );
  if (messageElements.length > 0) {
    const messageElement = messageElements[0];
    messageElement.parentElement.removeChild(messageElement);
  }
}

let pageLoaded = setInterval(function() {
  const tweetButton = document.querySelector(
    'div[data-testid="tweetButtonInline"]'
  );
  const draftTweetContainer = document.querySelector("span[data-text]");
  const tweetButtonParent = tweetButton.parentNode;
  const sidebar = document.querySelector(`div[data-testid="sidebarColumn"]`);
  sidebar.style.display = "none";

  if (tweetButton && draftTweetContainer) {
    clearInterval(pageLoaded);
    tweetButtonParent.insertBefore(einsteinLogoButton, tweetButton);
    function analyzeTweet() {
      const draftTweetSpan = document.querySelector("span[data-text]");
      const draftTweetText =
        draftTweetSpan !== null ? draftTweetSpan.textContent : "";
      const encodedTweet = encodeURI(draftTweetText);
      fetch(`${EINSTEIN_API_BASE_URL}?text=` + encodedTweet, {
        headers: { "Content-Type": "text/plain" }
      })
        .then(resp => resp.json())
        .then(predictionData => handleTweetResponse(predictionData));
    }
    setInterval(analyzeTweet, 5000);
  }
}, 1000);
