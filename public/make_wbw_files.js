'use strict'

// Change file extension in all subfolders:
//      Get-ChildItem -File -Recurse | % { Rename-Item -Path $_.PSPath -NewName $_.Name.replace(".js",".json")}

const { func } = require("assert-plus");
var fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { window } = new JSDOM("");
const document = window.document;
const $ = require( "jquery" )( window );

let baseURL = "https://api.quran.com/api/v4/";
let languageQuery = "?language=en";
let translationId = "20";

let settings = {
    "async": false,
    "crossDomain": true,
    // "url": "",
    "method": "GET",
    "headers": {'Access-Control-Allow-Origin': 'x-requested-with'},
    // dataType: "jsonp",
    "data": "{}"
};


var chapters;


main();

function main() {
    getChapters();
    createFiles2();
}


function folderStr(c) {
    let str = c + '';
    if (str.length === 1) {
        str = '00'+str;
    } else if (str.length === 2) {
        str = '0'+str;
    }
    return 'translations/' + str;
}

function getChapters() {
    settings.url = baseURL + "chapters" + languageQuery;
    let response = JSON.parse($.ajax(settings).responseText);
    chapters = response.chapters;
}

function createFiles2() {
    var wbwPath, wbw, verse, arabic, translated, transliterated, str;
    for (let c = 1; c <= 114; c++) {
        str = folderStr(c);
        wbwPath = str+'/words.json';
        wbw = {};
        for (let v = 1; v <= chapters[c-1].verses_count; v++) {
            settings.url = `${baseURL}verses/by_key/${c}:${v}${languageQuery}&words=1&word_fields=location,text_uthmani`;
            verse = JSON.parse($.ajax(settings).responseText).verse;
            wbw[v] = [];
            for (let w = 0; w < verse.words.length - 1; w++) {
                arabic = verse.words[w].text_uthmani;
                translated = verse.words[w].translation.text;
                transliterated = verse.words[w].transliteration.text.replace(/ʿ/g, 'Ꜥ');
                if (translated) {
                   wbw[v].push([arabic, transliterated, translated]); 
                }                
            }
        }
        fs.writeFile(wbwPath, JSON.stringify(wbw, null, 4), function (err) {
            if (err) throw err;
        });
        console.log(c)
    }
}

function createFilesOld() {
    var wbwPath, enPath, wbw, en, verse, word, str;
    let enElement = document.createElement('div');
    for (let c = 1; c <= 114; c++) {
        str = folderStr(c);
        wbwPath = str+'/wbw.json';
        enPath = str+'/en.json';
        wbw = {};
        en = {};
        for (let v = 1; v <= chapters[c-1].verses_count; v++) {
            settings.url = `${baseURL}verses/by_key/${c}:${v}${languageQuery}&translations=${translationId}&words=1&word_fields=location`;
            verse = JSON.parse($.ajax(settings).responseText).verse;
            en[v] ='';
            enElement.innerHTML = verse.translations[0].text;
            enElement.childNodes.forEach((node) => {
                if (node.nodeType === window.Node.TEXT_NODE) {
                    en[v] += node.nodeValue;
                }
            });
            wbw[v] = [];
            for (let w = 0; w < verse.words.length - 1; w++) {
                word = verse.words[w].translation.text;
                if (word) {
                   wbw[v].push(word); 
                }                
            }
        }
        fs.writeFile(wbwPath, JSON.stringify(wbw, null, 4), function (err) {
            if (err) throw err;
        });
        fs.writeFile(enPath, JSON.stringify(en, null, 4), function (err) {
            if (err) throw err;
        });
        console.log(c)
    }
}

function createFolders() {
    var str;
    for (let i = 1; i <= 114; i++) {
        str = folderStr(i); 
        try {
            fs.mkdirSync(str, { recursive: true })
        } catch (e) {
            console.log(e)
        }
    }
}




