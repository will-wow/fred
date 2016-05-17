import natural = require('natural');
import _ = require('lodash');
import fs = require('fs');

const wordnet = new natural.WordNet();
let spellcheck: natural.Spellcheck;

// Parse some text for the spellchecker.
fs.readFile('./src/lib/big.txt', (err, data) => {
  if (err) {
    console.log('Spellcheck load error!', err);
    return;
  }

  const words = _.words(data.toString().toLocaleLowerCase());
  process.nextTick(() => {
    spellcheck = new natural.Spellcheck(words);
    console.log('spellcheck ready!');
  });
});

export

