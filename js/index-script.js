/*
Name: shortenLink()
Description: Use rel.ink's api to shorten link and add result to list
Parameter: none
Return: none
*/
function shortenLink() {
  var xhr = new XMLHttpRequest();
  var apiUrl = "https://rel.ink/api/links/";
  xhr.open("POST", apiUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 201) {
        var json = JSON.parse(xhr.responseText);
        var linkID = document.getElementById("shorten-links-list").getElementsByTagName("li").length + 1;
        addResult(linkID, json.url, "https://rel.ink/" + json.hashid);
        saveListLinksToCookie();
      }
  };

  var originalLink = document.getElementById("inputLink");
  var error = checkInputLink(originalLink.value);
  if(error === 0) {
    showError("", false);
    var data = JSON.stringify({"url": originalLink.value});
    xhr.send(data);
    originalLink.value = "";
  } else {
    showError(error, true);
  }
}

/*
Name: addResult(linkID, originalLink, shortenLink)
Description: Add result to list
Parameter: linkID => Int, originalLink => String, shortenLink => String
Return: none
*/
function addResult(linkID, originalLink, shortenLink) {
  var resultsList = document.getElementById("shorten-links-list");
  var shortenLinkID = "shortenLink-" + linkID;
  var copyBtnID = "copyBtn-" + linkID;

  var newItem = document.createElement("LI");
  var content = document.getElementById('result-template').content;
  var originalLinkText = content.querySelector('.original-link');
  var shortenLinkText = content.querySelector('.shorten-link');
  var copyButton = content.querySelector('.btn-copy');

  originalLinkText.textContent = originalLink;
  shortenLinkText.textContent = shortenLink;
  shortenLinkText.setAttribute("id", shortenLinkID);
  copyButton.setAttribute("id", copyBtnID);
  copyButton.setAttribute("onclick", "copyShortenLink('" + linkID + "')\;");

  newItem.appendChild(document.importNode(content, true));

  resultsList.insertBefore(newItem, resultsList.childNodes[0]);
}

/*
Name: showError(errorMessage, isError)
Description: Show message error when input link is not valid
Parameter: errorMessage => String, isError => Bool
Return: none
*/
function showError(errorMessage, isError) {
  document.getElementById('input-error-message').textContent = errorMessage;
  var inputTextbox = document.getElementById("inputLink");
  if(isError) {
    inputTextbox.classList.remove("normal-input");
    inputTextbox.classList.add("error-input");
  } else {
    inputTextbox.classList.remove("error-input");
    inputTextbox.classList.add("normal-input");
  }
  inputTextbox.focus();
}

/*
Name: checkInputLink(originalLink)
Description: Check input valid of input link
Parameter: originalLink => String
Return: true/false
*/
function checkInputLink(originalLink) {
  if(originalLink == "") {
    return "Please add a link";
  } else if (!validateUlr(originalLink)) {
    return "Invalid URL (\"https://www.example.com\")";
  }
  return 0;
}

/*
Name: validateUlr(url)
Description: Check input link format
Parameter: url => String
Return: true/false
*/
function validateUlr(url) {
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
  const result = url.match(regex);
  if (result) {
    return true;
  }
  return false;
}

/*
Name: copyShortenLink(copyID)
Description: Copy value of shorten link
Parameter: copyID => Int
Return: None
*/
function copyShortenLink(copyID) {
  var shortenLinkID = "shortenLink-" + copyID;
  var copyBtnID = "copyBtn-" + copyID;

  var text = document.getElementById(shortenLinkID).innerText;
  var elem = document.createElement("textarea");
  document.body.appendChild(elem);
  elem.value = text;
  elem.select();
  elem.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(elem);

  resetCopyButton(copyBtnID);
}

/*
Name: resetCopyButton(clickedBtnID)
Description: Reset styles all button copy, and add new style to button copied
Parameter: clickedBtnID => String
Return: None
*/
function resetCopyButton(clickedBtnID) {
  var i;
  var listButtons = document.getElementsByClassName("btn-copy");
  for (i = 0; i < listButtons.length; i++) {
     listButtons[i].textContent = "Copy";
     listButtons[i].classList.remove("copied");
  }

  var clickedBtn = document.getElementById(clickedBtnID);
  clickedBtn.textContent = "Copied!";
  clickedBtn.classList.add("copied");
}

/*
Name: loadListLinksFromCookie()
Description: Load list shorten links form cookies to page
Parameter: None
Return: None
*/
function loadListLinksFromCookie() {
  var linkListJson = getCookie("ResultsList");
  var linkListArr = JSON.parse(linkListJson);
  for(let i = linkListArr.length - 1; i >= 0; i--) {
    addResult(linkListArr[i].id, linkListArr[i].original, linkListArr[i].shorten);
  }
}

/*
Name: saveListLinksToCookie()
Description: Save list shortent Link to cookies
Parameter: None
Return: None
*/
function saveListLinksToCookie() {
  var linkListJson = getShortenLinkListJson();
  if(linkListJson != "") {
    setCookie("ResultsList", linkListJson, 30);
  }
}

/*
Name: getShortenLinkListJson()
Description: Create json string from list shorten links
Parameter: None
Return: None
*/
function getShortenLinkListJson() {
  var shortenList = document.getElementById("shorten-links-list").getElementsByTagName("li");
  var listArr = [];
  for(let i = 0; i < shortenList.length; i++) {
    var originalLinkText = shortenList[i].querySelector('.original-link').textContent;
    var shortenLinkText = shortenList[i].querySelector('.shorten-link').textContent;

    var shortenLinkObj = { id : shortenList.length - i, original : originalLinkText, shorten : shortenLinkText};
    listArr.push(shortenLinkObj);
  }
  return JSON.stringify(listArr);
}

/*
Name: getCookie(cname)
Description: get cookies's data by name
Parameter: cname => String
Return: None
*/
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/*
Name: setCookie(cname,cvalue,exdays)
Description: set cookies's data
Parameter: cname => String, cvalue => String, exdays => Int
Return: None
*/
function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/*
Name: deleteCookie(cname)
Description: delete cookies's data by name
Parameter: cname => String
Return: None
*/
function deleteCookie(cname) {
  document.cookie = cname +"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/*
Name: showHideMenu(x)
Description: Show hide menu
Parameter: x
Return: None
*/
function showHideMenu(x) {
  x.classList.toggle("change");
  document.getElementById("main-nav").classList.toggle("active-menu");
}
