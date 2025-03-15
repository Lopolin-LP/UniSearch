// Globals
const sre = "{{{s}}}" // Search Replace Entity

// Base64 https://stackoverflow.com/a/30106551 & https://stackoverflow.com/a/77383580
function base64Encode (str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function base64Decode (str) {
    return new TextDecoder().decode(Uint8Array.from(atob(str), m => m.charCodeAt(0)));
}

// Match bang
function matchBang(str) {
    // Returns the URL to navigate to; if not found, then undefined
    return bangs.filter(x => x.t === str)[0]?.u;
}

// replace sre with URL
function replaceSearchQuery(url, search) {
    return url.replace(sre, encodeURIComponent(search));
}

// Actual logic
const myurl = {};
myurl.param = new URLSearchParams(window.location.search);
myurl.raw = myurl.param.get("s")?.split(" "); // don't use
if (myurl.raw) {
    myurl.search = myurl.raw[0].startsWith("!") ? myurl.raw.splice(1).join(" ") : myurl.raw.splice(0, Infinity).join(" ");
    myurl.bang = myurl.raw.join(" ").replace("!", "");
    myurl.searchengine = myurl.param.get("e");
    exec();
}

function exec() {
    if (myurl.bang) {
        const bangMatch = matchBang(myurl.bang);
        if (bangMatch) {
            window.location.replace(replaceSearchQuery(bangMatch, myurl.search));
            return;
        } else {
            myurl.search = "!" + myurl.bang + " " + myurl.search; // yea we fakin' it
        }
    }
    if (myurl.searchengine) {
        window.location.replace(replaceSearchQuery(base64Decode(myurl.searchengine), myurl.search));
    }
}

// Other

function updateResult() {
    const se = document.getElementById("search-engine").value;
    let result = window.location.protocol + "//" + window.location.pathname + "?e=" + base64Encode(se) + "&s=%s";
    if (se === "") {
        result = "Input search engine.";
    } else if (se.indexOf(sre) == -1) {
        result = "Search Engine requires " + sre + " present.";
    } else {
        try {
            new URL(se);
        } catch (e) {
            result = "Search Engine URL is Invalid."
        }
    }
    document.getElementById("result").innerText = result;
}

function loadOldUrl() {
    try {
        const oldUrlParams = new URL(document.getElementById("old-url").value).searchParams;
        const oldSearchEngine = base64Decode(oldUrlParams.get("e"));
        document.getElementById("search-engine").value = oldSearchEngine;
        document.getElementById("old-url").value = "";
    } catch (e) {
        if (e.message == "URL constructor: wae is not a valid URL.") {
            alert("Input a valid URL.");
        } else {
            throw e;
        }
    }
    updateResult();
}

function copy_text(element) { // https://stackoverflow.com/a/34503498
    //Before we copy, we are going to select the text.
    let text = element;
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    //add to clipboard.
    document.execCommand('copy');
}

window.addEventListener("load", () => {
    document.querySelectorAll("input").forEach(x => x.addEventListener("input", updateResult));
    updateResult();
    document.getElementById("load-old-url").addEventListener("click", loadOldUrl);
    document.getElementById("result").addEventListener("click", e => copy_text(e.target));
    document.getElementById("result").addEventListener("keypress", e => {if (e.key === "Enter") copy_text(e.target);});
});