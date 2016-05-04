// Description:
//   Commands about words
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot spell <word> - Gives spelling suggestions.
//   hubot what does <word> mean? - Gives some definitions.
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import natural = require('natural');
import _ = require('lodash');
import fs = require('fs');

import personality from './lib/personality/currentPersonality';

const wordnet = new natural.WordNet();
let spellcheck: natural.Spellcheck;

// Parse some text for the spellchecker.
/**
fs.readFile('./src/lib/big.txt', (err, data) => {
  if (err) {
    return;
  }

  const words = _.words(data.toString().toLocaleLowerCase());
  process.nextTick(() => {
    spellcheck = new natural.Spellcheck(words);
    console.log('spellcheck ready!');
  });
});
 */
/** Look up the spelling of a word, and respond. */
function getSpelling(res: hubot.Response, word: string): string {
  if (spellcheck.isCorrect(word)) {
    return personality.getCurrent(res.message.room).wordSpellingCorrect();
  }

  const corrections = spellcheck.getCorrections(word, 1);

  if (!corrections.length) {
    return personality.getCurrent(res.message.room).wordSpellingNotFound();
  }

  return corrections.join(', ');
};

/** Respond to a a definition request. */
function handleDefinition(res: hubot.Response) {
  const word = res.match[1].toLowerCase();

  wordnet.lookup(word, (results): void => {
    // Handle a failed lookup.
    if (!results.length) {
      res.send(personality.getCurrent(res.message.room).wordDefinitionNotFound());
      return;
    }

    // Pick a random result.
    const result = _.sample(results);
    // Send the definition.
    res.send(
`${result.pos}: ${result.gloss}
Synonyms: ${result.synonyms}`
    );
  });
}

export = (robot: hubot.Robot) => {
  robot.respond(/(?:how do (?:you|I) )?spell (.+)\??$/i, (res: hubot.Response) => {
    const input = res.match[1].toLowerCase();
    const words = _.words(input);

    if (words.length === 1) {
      res.send(getSpelling(res, words[0]));
      return;
    }

    const response: string = _.map(words, function (word) {
      return `${word}: ${getSpelling(res, word)}`;
    }).join('\n');

    res.send(response);
  });

  robot.respond(/what does (.+) mean/i, handleDefinition);
  robot.respond(/define (.+)/i, handleDefinition);
  robot.respond(/.*definition of (.+)/i, handleDefinition);
};
