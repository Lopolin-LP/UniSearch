// Site
const mysite = `
<main>
    <h1>UniSearch</h1>
    <p>Your favourite search engine + DuckDuckGo Bangs</p>
    <h1>Configure</h1>
    <label for="search-engine">Search Engine (<code>{{{s}}}</code> for search query)</label>
    <input name="search-engine" id="search-engine" type="text" placeholder="e.g. https://www.qwant.com/?q={{{s}}}">
    <h1>Result</h1>
    <p>Set this as your search engine.</p>
    <p>Auto copies to clipboard on click or enter-press while focused.</p>
    <code id="result" tabindex="0"></code>
    <h1>Load old Configuration</h1>
    <span>
        <label for="old-url">Old URL</label>
        <input name="old-url" id="old-url" type="text">
        <button id="load-old-url" type="button">Load</button>
    </span>
    <h1>Notes</h1>
    <p>This site has next to no error handling. If you type something wrong, that's your problem.</p>
    <p>Inspired by <a href="https://github.com/t3dotgg/unduck" target="_blank">Unduck</a></p>
    <p>Stole Bangs from <a href="https://duckduckgo.com/bang.js" target="_blank">here</a></p>
    <p>Source Code on <a href="https://github.com/Lopolin-LP/UniSearch" target="_blank">GitHub</a></p>
</main>
`;

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
function replaceSearchQuery(url, search, onsuccess=()=>{}, onerror=()=>{}) {
    const place = url.replace(sre, encodeURIComponent(search));
    if (url.indexOf(sre) === -1) onerror(place); else onsuccess(place);
    return place;
}

// Actual logic
function exec() {
    const myurl = {};
    let code = 0;
    myurl.param = new URLSearchParams(window.location.search);
    myurl.raw = myurl.param.get("s")?.split(" "); // don't use
    const ifNotReplaced = () => {
        alert("Search Engine didn't contain " + sre + ". Please update the search engine link.");
        code = 1;
    }
    if (myurl.raw) {
        myurl.search = myurl.raw[0].startsWith("!") ? myurl.raw.splice(1).join(" ") : myurl.raw.splice(0, Infinity).join(" ");
        myurl.bang = myurl.raw.join(" ").replace("!", "");
        myurl.searchengine = myurl.param.get("e");
        if (myurl.bang) {
            const bangMatch = matchBang(myurl.bang);
            if (bangMatch) {
                replaceSearchQuery(bangMatch, myurl.search, x => window.location.replace(x), ifNotReplaced);
                return code;
            } else {
                myurl.search = "!" + myurl.bang + " " + myurl.search; // yea we fakin' it
            }
        }
        if (myurl.searchengine) {
            replaceSearchQuery(base64Decode(myurl.searchengine), myurl.search, x => window.location.replace(x), ifNotReplaced);
            return code;
        }
    }
    // On error
    return 1;
}

if (exec() === 1) {
    window.areWeUI = true;
}

// Other
if (window.areWeUI) {
    function updateResult() {
        const se = document.getElementById("search-engine").value;
        let result = (window.location.origin != "null" ? window.location.origin : window.location.protocol + "//" + window.location.host) + window.location.pathname + "?e=" + base64Encode(se) + "&s=%s";
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
    
    function loadOldUrl(customurl=undefined) {
        try {
            const oldUrlParams = new URL(typeof customurl === "string" ? customurl : document.getElementById("old-url").value).searchParams;
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
    
    window.addEventListener("manualload", () => {
        document.querySelectorAll("input").forEach(x => x.addEventListener("input", updateResult));
        updateResult();
        document.getElementById("load-old-url").addEventListener("click", loadOldUrl);
        if (window.location.search) loadOldUrl(window.location.href);
        document.getElementById("result").addEventListener("click", e => copy_text(e.target));
        document.getElementById("result").addEventListener("keypress", e => {if (e.key === "Enter") copy_text(e.target);});
    });
}