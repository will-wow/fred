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
import LoanApplications from './lib/prequal/LoanApplications';

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
  const loanApps = new LoanApplications(robot);

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

  /* KICKOUT QUESTIONS */
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
        ask(res, 'PREQUAL_ZIP');
      } else {
        res.send('Sorry, we only do loans for non-owner-occupied properties.');
      }
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  /* PREQUAL QUESTIONS */
  nlc.registerQuestion({
    name: 'PREQUAL_ZIP',
    slotType: 'WORD',
    questionCallback: (res: hubot.Response) => res.send(`Okay, what's the property zip code?`),
    successCallback: (res: hubot.Response, zip: string) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyPostalCode = zip;

      ask(res, 'PREQUAL_STATE');
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_STATE',
    slotType: 'WORD',
    questionCallback: (res: hubot.Response) => res.send(`And what's the property state?`),
    successCallback: (res: hubot.Response, state: string) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyState = state;

      // Load the base rate from the property location.
      loanApp.engine.loadBaseRate()
        .then(() => {
          // If the base rate loaded, the property is valid.
          ask(res, 'PREQUAL_LOAN_PURPOSE_TYPE');
        })
        .catch((kickout: string) => {
          // If it failed, respond with the kickout.
          res.send(`Sorry we don't lend in that area: ${kickout}`);
        });
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.addSlotType({
    type: 'LOAN_PURPOSE_TYPE',
    matcher: (text: string): string => {
      if (_.includes(['purchase', 'buy'], text.toLocaleLowerCase())) {
        return 'purchase';
      } else if (_.includes(['refinance', 'refi'], text.toLocaleLowerCase())) {
        return 'refinance';
      }
    }
  });

  nlc.registerQuestion({
    name: 'PREQUAL_LOAN_PURPOSE_TYPE',
    slotType: 'LOAN_PURPOSE_TYPE',
    utterances: [
      '{Slot}',
      `I'm {Slot}ing`,
      `im {Slot}ing`,
      `It's a {Slot}`,
      `its a {Slot}`
    ],
    questionCallback: (res: hubot.Response) => res.send(`Good news, we do lend in that area! Now, is this a purchase or a refinance?`),
    successCallback: (res: hubot.Response, loanPurposeType: string) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.loanPurposeType = loanPurposeType;

      if (loanApp.isPurchase) {
        ask(res, 'PREQUAL_propertyPurchaseAmount');
      } else {
        ask(res, 'PREQUAL_currentPropertyValueAmount');
      }
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_propertyPurchaseAmount',
    slotType: 'NUMBER',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    questionCallback: (res: hubot.Response) => res.send(`What's the purchase price for the property?`),
    successCallback: (res: hubot.Response, propertyPurchaseAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyPurchaseAmount = propertyPurchaseAmount;

      ask(res, 'PREQUAL_desiredPropertyLoanAmount');
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_additionalCashOutAmount',
    slotType: 'NUMBER',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    questionCallback: (res: hubot.Response) => res.send(`How much is your property worth?`),
    successCallback: (res: hubot.Response, currentPropertyValueAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.currentPropertyValueAmount = currentPropertyValueAmount;

      ask(res, 'PREQUAL_desiredPropertyLoanAmount');
    },
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
  });

  nlc.registerQuestion({
    name: 'PREQUAL_propertyLoanAmount',
    slotType: 'NUMBER',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    questionCallback: (res: hubot.Response) => res.send(`And how much financing are you looking for?`),
    successCallback: (res: hubot.Response, propertyLoanAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyLoanAmount = propertyLoanAmount;

      if (loanApp.isBelowLoanMin) {
        res.send(`Sorry, that is below our $${loanApp.loanMin} minimum.`);
        return;
      } else if (loanApp.isAboveLoanMax) {
        res.send(`Sorry, that is above our $${loanApp.loanMin} maximum.`);
        return;
      }

      // loanApp.engine.getRate()
      ask(res, 'PREQUAL_additionalCashOutAmount');
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
    callback: (res: hubot.Response) => {
      loanApps.create(res.message.user.id);
      ask(res, 'PREQUAL_IS_RESIDENTIAL');
    }
  });
};
