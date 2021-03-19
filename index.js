var levenshtein = require("fast-levenshtein");
var jaro = require('wink-jaro-distance');
var dice = require("string-similarity");
Array.prototype.getIndex = function(source, value) {
    return this.find(e => e[source] == value);
};
const Matcher = class {
    constructor(dataSet) {
        this.dataSet = dataSet;
    }
    async match(config) {
        return new Promise((resolve, reject) => {
            if (config.fullEqual === false && -1 == this.algorithms.indexOf(config.algorithm)) {
                reject(new Error(`Algorithim not found. Chose one ${this.algorithms.reduce((prev,next)=>prev+next),''}`))
            }
            if (config.structure.object === true) {
                let totalStructrueSuccess = 0;

                this.asyncForEach(Object.keys(this.dataSet), async(data, key) => {
                    await this.objectTest(this.dataSet[data], config.structure.type[data])
                        .then((a) => {
                            totalStructrueSuccess++;
                        })
                        .catch((err) => {
                            console.log(data, "Structure Testing.", false, err);
                        });
                    if (Object.keys(this.dataSet).length == totalStructrueSuccess) {
                        console.log("Data Set Structre test Succesfully. Pairing function start.");
                        resolve(this.object_match(config))
                    }
                });

            } else if (config.structure.object === false) {
                switch (config.structure.type) {
                    case "string":
                        resolve(this.string_match(config, this.dataSet));
                    default:
                        reject(new Error("Invalid structure type: " + config.structure.type));
                }
            }
        })

    }
    string_match(config) {
        const PAIRING_ARRAY = [];
        const maxLenghtArray = Object.keys(this.dataSet)
            .map((key) => {
                return { key, length: this.dataSet[key].length };
            })
            .reduce(
                (prev, next) =>
                next.length > prev.length ? { key: next.key, length: next.length } :
                prev, { key: null, length: null }
            ).key;
        for (var index = 0; this.dataSet[maxLenghtArray].length > index; index++) {
            const PAIRING_ELEMENT = { indexs: {}, similarityPoints: {} };
            const mainword = this.dataSet[maxLenghtArray][index];
            Object.keys(this.dataSet)
                .filter((e) => e != maxLenghtArray)
                .forEach((data) => {
                    if (config.fullEqual === true) {
                        let indexElement = this.dataSet[data].indexOf(mainword);
                        if (indexElement != -1) {
                            PAIRING_ELEMENT[data] = this.dataSet[data][indexElement]
                            PAIRING_ELEMENT.indexs[data] = indexElement
                            PAIRING_ELEMENT.similarityPoints[data] = 1
                        }
                    } else {
                        if (config.algorithm == "levenshtein") {
                            var mostLiked = this.levenshtein_similarity(mainword, this.dataSet[data], data)
                            var similarityPoint = Math.round((Math.max(mostLiked.targetword.length, mainword.length) - mostLiked.distance) / Math.max(mostLiked.targetword.length, mainword.length) * 1000) / 1000;
                        } else if (config.algorithm == "jaro") {
                            var mostLiked = this.jaro_similarity(mainword, this.dataSet[data], data)
                            var similarityPoint = Math.round((mostLiked.similarityPoint) * 1000) / 1000;
                        } else if (config.algorithm == "dice") {
                            var mostLiked = this.dice_similarity(mainword, this.dataSet[data], data)
                            var similarityPoint = Math.round((mostLiked.similarityPoint) * 1000) / 1000;

                        }

                        if (similarityPoint > config.similarityPoint) {
                            PAIRING_ELEMENT[data] = mostLiked.targetword
                            PAIRING_ELEMENT.indexs[data] = mostLiked.key
                            PAIRING_ELEMENT.similarityPoints[data] = similarityPoint
                        }
                    }
                });

            if (Object.keys(PAIRING_ELEMENT.indexs).length > 0) {
                PAIRING_ELEMENT[maxLenghtArray] = this.dataSet[maxLenghtArray][index]
                PAIRING_ELEMENT.indexs[maxLenghtArray] = index
                PAIRING_ELEMENT.similarityPoints[maxLenghtArray] = 1
                PAIRING_ARRAY.push(PAIRING_ELEMENT);
            }

        }
        return PAIRING_ARRAY;
    }
    objectTest(object, structure) {
        return new Promise((resolve, reject) => {
            if (
                object.every((o) => {
                    if (o[structure.index] && o[structure.value]) {
                        return true;
                    } else {
                        return false;
                    }
                })
            )
                resolve(true);
            else reject(false);
        });
    }
    asyncForEach = async(array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    };
    object_match = async(config) => {
        const PAIRING_ARRAY = [];
        const maxLenghtArray = Object.keys(this.dataSet)
            .map((key) => {
                return { key, length: this.dataSet[key].length };
            })
            .reduce(
                (prev, next) =>
                next.length > prev.length ? { key: next.key, length: next.length } :
                prev, { key: null, length: null }
            ).key;

        for (var index = 0; this.dataSet[maxLenghtArray].length > index; index++) {
            // console.log(index, this.dataSet[maxLenghtArray].length)
            const PAIRING_ELEMENT = { indexs: {}, similarityPoints: {} };
            const mainword = this.dataSet[maxLenghtArray][index][config.structure.type[maxLenghtArray].value];
            Object.keys(this.dataSet)
                .filter((e) => e != maxLenghtArray)
                .forEach((data) => {
                    if (config.fullEqual === true) {
                        let indexElement = this.dataSet[data].find(a => a[config.structure.type[data].value] == mainword);

                        if (indexElement && indexElement != null && indexElement != undefined) {
                            PAIRING_ELEMENT[data] = indexElement[config.structure.type[data].value]
                            PAIRING_ELEMENT.indexs[data] = indexElement[config.structure.type[data].index]
                            PAIRING_ELEMENT.similarityPoints[data] = 1
                        }
                    } else {

                        if (config.algorithm == "levenshtein") {
                            var mostLiked = this.levenshtein_similarity(mainword, this.dataSet[data].map((target, key) => target[config.structure.type[data].value]), data)
                            var similarityPoint = Math.round((Math.max(mostLiked.targetword.length, mainword.length) - mostLiked.distance) / Math.max(mostLiked.targetword.length, mainword.length) * 1000) / 1000;
                        } else if (config.algorithm == "jaro") {
                            var mostLiked = this.jaro_similarity(mainword, this.dataSet[data].map((target, key) => target[config.structure.type[data].value]), data)
                            var similarityPoint = Math.round((mostLiked.similarityPoint) * 1000) / 1000;
                        } else if (config.algorithm == "dice") {
                            var mostLiked = this.dice_similarity(mainword, this.dataSet[data].map((target, key) => target[config.structure.type[data].value]), data)
                            var similarityPoint = Math.round((mostLiked.similarityPoint) * 1000) / 1000;

                        }

                        if (similarityPoint > config.similarityPoint) {
                            PAIRING_ELEMENT[data] = mostLiked.targetword
                            PAIRING_ELEMENT.indexs[data] = this.dataSet[data][mostLiked.key][config.structure.type[data].index]
                            PAIRING_ELEMENT.similarityPoints[data] = similarityPoint
                        }
                    }
                });

            if (Object.keys(PAIRING_ELEMENT.indexs).length > 0) {
                PAIRING_ELEMENT[maxLenghtArray] = this.dataSet[maxLenghtArray][index][config.structure.type[maxLenghtArray].value]
                PAIRING_ELEMENT.indexs[maxLenghtArray] = this.dataSet[maxLenghtArray][index][config.structure.type[maxLenghtArray].index]
                PAIRING_ELEMENT.similarityPoints[maxLenghtArray] = 1
                PAIRING_ARRAY.push(PAIRING_ELEMENT);
            }
        }
        return PAIRING_ARRAY;

    }
    levenshtein_similarity = (mainword, words, data) => {
        return words.map((targetword, key) => {
                var distance = levenshtein.get(mainword, targetword);
                return { mainword, targetword, distance, data, key };
            })
            .reduce(
                (prev, next) => (next.distance < prev.distance ? next : prev), { distance: mainword.length + 1 }
            );

    }
    jaro_similarity = (mainword, words, data) => {
        return words.map((targetword, key) => {
                const similarityPoint = jaro(mainword, targetword).similarity;
                return { mainword, targetword, similarityPoint, data, key };
            })
            .reduce(
                (prev, next) => (next.similarityPoint > prev.similarityPoint ? next : prev), { similarityPoint: 0 }
            );

    }
    dice_similarity = (mainword, words, data) => {
        return words.map((targetword, key) => {
                const similarityPoint = dice.compareTwoStrings(mainword, targetword);
                return { mainword, targetword, similarityPoint, data, key };
            })
            .reduce(
                (prev, next) => (next.similarityPoint > prev.similarityPoint ? next : prev), { similarityPoint: 0 }
            );

    }
    algorithms = ["levenshtein", "jaro", "dice"]
};

module.exports = Matcher;