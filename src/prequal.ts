// Description:
//   Commands for getting a loan prequal.
//
// Dependencies:
//
// Configuration:
//
// Commands:
//   hubot
//
// Author:
//   Will Lee-Wagner <will@assetavenue.com>

import _ = require('lodash');

import nlc from './lib/nlc/naturalLanguageCommander';
import personality from './lib/personality/currentPersonality';

const TRUE_LIST = [
  'true',
  'yes',
  'yeah',
  'yup',
  'correct',
  'uhhuh',
  'uh huh',
  'mmhm'
];

const FALSE_LIST = [
  'false',
  'no',
  'nope',
  'naw',
  'nah'
];

const CANCEL_MESSAGE = `Okay. Good luck!`;
const FAIL_MESSAGE = `Sorry, I'm not sure what you're looking for. You can say "I want a loan" to start again.`;

function ask(res: hubot.Response, question: string) {
  nlc.ask({
    userId: res.message.user.id,
    data: res,
    question: question
  });
}

export = (robot: hubot.Robot) => {
  nlc.addSlotType({
    type: 'BOOLEAN',
    matcher: (text: string) => {
      text = text.toLowerCase();

      if (_.includes(TRUE_LIST, text)) {
        return true;
      } else if (_.includes(FALSE_LIST, text)) {
        return false;
      } else {
        return undefined;
      }
    },
    baseMatcher: '[\\w ]+'
  });

  nlc.addSlotType({
    type: 'A_LOAN',
    matcher: [
      'a loan',
      'financing',
      'money'
    ],
    baseMatcher: '[\\w ]+'
  });

  /* QUESTIONS */
  nlc.registerQuestion({
    name: 'PREQUAL_IS_RESIDENTIAL',
    slotType: 'BOOLEAN',
    questionCallback: (res: hubot.Response) => res.send(`Great! Is the loan for a residential property?`),
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (answer) {
        ask(res, 'PREQUAL_IS_NON_OWNER_OCCUPIED');
      } else {
        res.send('Sorry, we only do loans for residential properties.');
      }
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_IS_NON_OWNER_OCCUPIED',
    slotType: 'BOOLEAN',
    questionCallback: (res: hubot.Response) => res.send(`Sounds good! Are you going to live in the property?`),
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (!answer) {
        ask(res, 'PREQUAL_IS_COOL');
      } else {
        res.send('Sorry, we only do loans for non-owner-occupied properties.');
      }
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_IS_COOL',
    slotType: 'BOOLEAN',
    questionCallback: (res: hubot.Response) => res.send(`Great! One more question. Do you think you might be an idiot?`),
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (!answer) {
        res.send(`Well then, we might do your deal! Go to http://assetavenue.com to fill out an application.`);
      } else {
        res.send(`Oh, sorry, we don't lend to idiots.`);
      }
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });


  /* START PREQUAL */
  nlc.registerIntent({
    intent: 'PREQUAL_START',
    slots: [
      {
        name: 'ALoan',
        type: 'A_LOAN'
      }
    ],
    utterances: [
      'can I get {ALoan}',
      'I want {ALoan}',
      'I need {ALoan}',
      `I'm looking for {ALoan}`,
      'Can you do my deal',
      'Can you do this deal'
    ],
    callback: (res: hubot.Response) => ask(res, 'PREQUAL_IS_RESIDENTIAL'),
  });
};
