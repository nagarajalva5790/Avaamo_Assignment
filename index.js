const fetch = require("node-fetch");

const DICTIONARY_API_KEY = 'dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf';
const DICTIONARY_URL = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${DICTIONARY_API_KEY}&lang=en-ru`


fetch('http://norvig.com/big.txt')
    .then((resp) => resp.text()).then(function (data) {

        var ArrWords = fnsplitByWords(data);
        var MapWords = fncreateWordMap(ArrWords);
        var ArrFinalWords = fnsortByCount(MapWords);

        //console.log(finalWordsArray);
        console.log('Top 10 words');
        console.log('-------------------');

        for (var i = 0; i < 10; i++) {
            console.log('word : "' + ArrFinalWords[i].name + '" Count: ' + ArrFinalWords[i].total + ' times');
            collectDetails(ArrFinalWords[i])
        }


    });


function collectDetails(word) {
    var wordobj = [];
    fetch(`${DICTIONARY_URL}&text=${word.name}`)
        .then(res => res.json())
        .then(data => {

            var synmean = [];
            if (data.def[0] && data.def[0].tr[0].syn) {
                data.def[0].tr[0].syn.forEach((key) => {
                    synmean.push({ "text": key.text, "pos": key.pos });
                });
            }
            else if (data.def[0] && data.def[0].tr[0].mean) {
                data.def[0].tr[0].mean.forEach((key) => {
                    synmean.push({ "text": key.text });
                });
            } else {
                synmean.push({});
            }


            wordobj.push({
                "WORD": word.name, "OUTPUT": {
                    "count": word.total,
                    //"Synonyms/Mean":data.def[0]?JSON.stringify({"text":data.def[0].tr[0].syn[0].text,"pos":data.def[0].tr[0].syn[0].pos}):' ',
                    "Synonyms/Mean": data.def[0] ? synmean : null,
                    "Pos": data.def[0] ? data.def[0].pos : ' '
                }
            });
        })
        .then(() => console.log(JSON.stringify(wordobj)))
        .catch(err => console.log(err));

}

// split string by spaces 
function fnsplitByWords(text) {

    var wordsArray = text.split(/\s+/);
    return wordsArray;
}

//  Mapping for each words.
function fncreateWordMap(wordsArray) {
    var wordsMap = {};

    wordsArray.forEach(function (key) {
        if (wordsMap.hasOwnProperty(key)) {
            wordsMap[key]++;
        } else {
            wordsMap[key] = 1;
        }
    });
    return wordsMap;
}

// sorting the words based on occurance in ascending order.
function fnsortByCount(wordsMap) {
    
    var finalWordsArray = [];
    finalWordsArray = Object.keys(wordsMap).map(function (key) {
        return {
            name: key,
            total: wordsMap[key]
        };
    });

    finalWordsArray.sort(function (a, b) {
        return b.total - a.total;
    });

    return finalWordsArray;
}