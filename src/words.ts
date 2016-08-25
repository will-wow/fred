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
import spellcheckLoader from './lib/spellcheckLoader';
import nlc from './lib/nlc/naturalLanguageCommander';

const wordnet = new natural.WordNet();
let spellcheck: natural.Spellcheck;

spellcheckLoader.then((spellcheckInstance) => {
  spellcheck = spellcheckInstance;
});

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

const spellWords = (res: hubot.Response, input: string) => {
  // Lowercase for better lookup.
  input = input.toLowerCase();
  // Split out words to spell each one.
  const words = _.words(input);

  // Spell a single word.
  if (words.length === 1) {
    res.send(getSpelling(res, words[0]));
    return;
  }

  // Spell multiple words.
  const response: string = _.map(words, function (word) {
    return `${word}: ${getSpelling(res, word)}`;
  }).join('\n');

  res.send(response);
};

/** Respond to a a definition request. */
const defineWord = (res: hubot.Response, word: string): void => {
  // Lowercase for better lookup.
  word = word.toLowerCase();

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
};

export = (robot: hubot.Robot) => {
  // Spell a word or words
  nlc.registerIntent({
    intent: 'WORD_SPELL',
    slots: [
      {
        name: 'Input',
        type: 'STRING',
      }
    ],
    callback: spellWords,
    utterances: [
      `spell {Input}`,
      `how do you spell {Input}`,
      `how do I spell {Input}`,
      `spellcheck {Input}`
    ]
  });

  // Define a word
  nlc.registerIntent({
    intent: 'WORD_DEFINE',
    slots: [
      {
        name: 'Word',
        type: 'STRING',
      }
    ],
    callback: defineWord,
    utterances: [
      `what does {Word} mean`,
      `what's {Word} mean`,
      `define {Word}`,
      `definition of {Word}`,
      `what's the definition of {Word}`,
      `what is the definition of {Word}`,
      `what's the word {Word} mean`,
      `what does the word {Word} mean`,
      `what's a {Word}`,
      `what's an {Word}`
    ]
  });
};
