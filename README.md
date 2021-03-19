# index-matcher 


## Installation

```bash
$ npm install index-matcher
```


## Algorithims

* levenshtein
* jaro
* dice

## Examples

**no-object usage**

```javascript
const Matcher = require("index-matcher");

const store_a = ["clothes", "food", "electronic"];
const store_b = ["foods", "electronic stuff", "clotheses"];
const store_c = ["clothes all", "electronic and things", "fooooods"];
const store_d = ["fods", "clothedes", "electric", ];

(async() => {
    const pairing = new Matcher({ store_a, store_b, store_c, store_d });
    const Pair = await pairing.match({
        fullEqual: false,
        algorithm: 'dice',
        similarityPoint: 0.100,
        structure: {
            object: false,
            type: "string",
        },
    })

    console.log(Pair)
//     [
//   {
//     indexs: { store_b: 2, store_c: 0, store_d: 1, store_a: 0 },
//     similarityPoints: { store_b: 0.857, store_c: 0.8, store_d: 0.857, store_a: 1 },
//     store_b: 'clotheses',
//     store_c: 'clothes all',
//     store_d: 'clothedes',
//     store_a: 'clothes'
//   },
//   {
//     indexs: { store_b: 0, store_c: 2, store_d: 0, store_a: 1 },
//     similarityPoints: { store_b: 0.857, store_c: 0.6, store_d: 0.667, store_a: 1 },
//     store_b: 'foods',
//     store_c: 'fooooods',
//     store_d: 'fods',
//     store_a: 'food'
//   },
//   {
//     indexs: { store_b: 1, store_c: 1, store_d: 2, store_a: 2 },
//     similarityPoints: { store_b: 0.783, store_c: 0.667, store_d: 0.75, store_a: 1 },
//     store_b: 'electronic stuff',
//     store_c: 'electronic and things',
//     store_d: 'electric',
//     store_a: 'electronic'
//   }
// ]
})();
```

**object usage**


```javascript
(async() => {

    const bookstore_a = [
        { bookname: "Nutuk - The Speech by Mustafa Kemal Ataturk", bookcode: 12412 },
        { bookname: "Anna Karenina (Oxford World's Classics)", bookcode: 43536 },
        { bookname: "Serenad", bookcode: 21245 }
    ]

    const bookstore_b = [{ name_book: "Serenade Fur Nadia", code_book: 41325 },
        { name_book: "Nutuk : Ataturk", code_book: 12412 },
        { name_book: "Anna Karenina : Tolstoy", code_book: 31251 }
    ]
    const pairing = new Matcher({ bookstore_a, bookstore_b });

    const Pair = await pairing.match({
        fullEqual: false,
        similarityPoint: 0.400,
        algorithm: 'dice',
        structure: {
            object: true,
            type: {
                bookstore_a: {
                    index: "bookcode",
                    value: "bookname"
                },
                bookstore_b: {
                    index: "code_book",
                    value: "name_book"
                }
            }
        }
    })

    console.log(Pair)
// [
//   {
//     indexs: { bookstore_b: 12412, bookstore_a: 12412 },
//     similarityPoints: { bookstore_b: 0.426, bookstore_a: 1 },
//     bookstore_b: 'Nutuk : Ataturk',
//     bookstore_a: 'Nutuk - The Speech by Mustafa Kemal Ataturk'
//   },
//   {
//     indexs: { bookstore_b: 31251, bookstore_a: 43536 },
//     similarityPoints: { bookstore_b: 0.415, bookstore_a: 1 },
//     bookstore_b: 'Anna Karenina : Tolstoy',
//     bookstore_a: "Anna Karenina (Oxford World's Classics)"
//   },
//   {
//     indexs: { bookstore_b: 41325, bookstore_a: 21245 },
//     similarityPoints: { bookstore_b: 0.571, bookstore_a: 1 },
//     bookstore_b: 'Serenade Fur Nadia',
//     bookstore_a: 'Serenad'
//   }
// ]

```
**getIndex()**


```javascript
(async() => {

console.log(Pair.getIndex('bookstore_b', 'Nutuk : Ataturk'))
// {
//   indexs: { bookstore_b: 12412, bookstore_a: 12412 },
//   similarityPoints: { bookstore_b: 0.426, bookstore_a: 1 },
//   bookstore_b: 'Nutuk : Ataturk',
//   bookstore_a: 'Nutuk - The Speech by Mustafa Kemal Ataturk'
// }


```




