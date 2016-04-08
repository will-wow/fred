// Description:
//   Commands about words
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot how do you spell <word> - Gives spelling suggestions.
//   hubot what does <word> mean? - Gives some definitions.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import natural = require('natural');
import _ = require('lodash');
import fs = require('fs');

const wordnet = new natural.WordNet();
let spellcheck: natural.Spellcheck;

function getSpelling(word: string): string {
  if (spellcheck.isCorrect(word)) {
    return `Correct!`;
  }

  const corrections = spellcheck.getCorrections(word, 1);

  if (!corrections.length) {
    return `I don't know.`;
  }

  return corrections.join(', ');
};

fs.readFile('./src/lib/big.txt', (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const words = _.words(data.toString().toLocaleLowerCase());
  spellcheck = new natural.Spellcheck(words);
  console.log('spellcheck ready!');
});

export = (robot: hubot.Robot) => {
  robot.respond(/how do (?:you|I) spell (.+)\??$/i, (res: hubot.Response) => {
    const input = res.match[1];
    const words = _.words(input);

    if (words.length === 1) {
      res.send(getSpelling(words[0]));
      return;
    }

    const response: string = _.map(words, function (word) {
      return `${word}: ${getSpelling(word)}`;
    }).join('\n');

    res.send(response);
  });

  robot.respond(/what does (.+) mean/i, (res: hubot.Response) => {
    const word = res.match[1];

    wordnet.lookup(word, (results): void => {
      // Pick a random result.
      const result = _.sample(results);
      // Send the definition.
      res.send(
`${result.pos}: ${result.gloss}
Synonyms: ${result.synonyms}`
      );
    });
  });
};
