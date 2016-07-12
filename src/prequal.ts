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
import BridgeLoanApplication from './lib/prequal/BridgeLoanApplication';
import ApiUtils from './lib/ApiUtils';

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

const KICKOUT_MESSAGES = {
  loan_amount_exceeded: 'Sorry, we currently do not offer loans exceeding $2,000,000.',
  loan_below_minimum: 'Sorry, this loan does not meet our $75,000 minimum loan amount requirement.',
  bad_credit: 'Sorry, we currently do not lend to borrowers who have a FICO score less than 650.',
  super_credit: 'Sorry, valid FICO ranges are 500-850.',
  high_ltv: 'Sorry, we only offer loans up to 75% of the property value'
};

function ask(res: hubot.Response, question: string) {
  nlc.ask({
    userId: res.message.user.id,
    data: res,
    question: question
  });
}

function registerPrequalQuestion(options: {
  name: string,
  slotType: string,
  question: string,
  successCallback: (res: hubot.Response, answer: any) => void,
  utterances?: string[]
}): void {
  nlc.registerQuestion({
    name: options.name,
    slotType: options.slotType,
    utterances: options.utterances,
    questionCallback: (res: hubot.Response) => res.send(options.question),
    successCallback: options.successCallback,
    cancelCallback: (res: hubot.Response) => res.send(CANCEL_MESSAGE),
    failCallback: (res: hubot.Response) => res.send(FAIL_MESSAGE),
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
  registerPrequalQuestion({
    name: 'PREQUAL_IS_RESIDENTIAL',
    slotType: 'BOOLEAN',
    question: `Great! Is the loan for a residential property?`,
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (answer) {
        ask(res, 'PREQUAL_IS_NON_OWNER_OCCUPIED');
      } else {
        res.send('Sorry, we only do loans for residential properties.');
      }
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_IS_RESIDENTIAL',
    slotType: 'BOOLEAN',
    question: `Great! Is the loan for a residential property?`,
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (answer) {
        ask(res, 'PREQUAL_IS_NON_OWNER_OCCUPIED');
      } else {
        res.send('Sorry, we only do loans for residential properties.');
      }
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_IS_NON_OWNER_OCCUPIED',
    slotType: 'BOOLEAN',
    question: `Sounds good! Are you going to live in the property?`,
    successCallback: (res: hubot.Response, answer: boolean) => {
      if (!answer) {
        ask(res, 'PREQUAL_ZIP');
      } else {
        res.send('Sorry, we only do loans for non-owner-occupied properties.');
      }
    }
  });

  nlc.addSlotType({
    type: 'PREQUAL_ZIP',
    matcher: (zip: string): string => {
      // Only return the first 5 digits.
      return zip.match(/\d{5}/)[0] || undefined;
    },
    baseMatcher: '\\d\\d\\d\\d\\d(?:-\\d\\d\\d\\d)?'
  });

  /* PREQUAL QUESTIONS */
  registerPrequalQuestion({
    name: 'PREQUAL_ZIP',
    slotType: 'PREQUAL_ZIP',
    question: `Okay, what's the property zip code?`,
    successCallback: (res: hubot.Response, zip: string) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyPostalCode = zip;

      ask(res, 'PREQUAL_STATE');
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_STATE',
    slotType: 'WORD',
    question: `And what's the property state abbreviation?`,
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
    }
  });

  nlc.addSlotType({
    type: 'LOAN_PURPOSE_TYPE',
    matcher: (text: string): string => {
      if (_.includes(['purchase', 'purchas', 'buy'], text.toLocaleLowerCase())) {
        return 'purchase';
      } else if (_.includes(['refinance', 'refinanc', 'refi'], text.toLocaleLowerCase())) {
        return 'refinance';
      }
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_LOAN_PURPOSE_TYPE',
    slotType: 'LOAN_PURPOSE_TYPE',
    utterances: [
      '{Slot}',
      `I'm {Slot}ing`,
      `im {Slot}ing`,
      `It's a {Slot}`,
      `its a {Slot}`
    ],
    question: `Great, we do lend in that area! Now, is this a purchase or a refinance?`,
    successCallback: (res: hubot.Response, loanPurposeType: string) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.loanPurposeType = loanPurposeType;

      if (loanApp.isPurchase) {
        ask(res, 'PREQUAL_propertyPurchaseAmount');
      } else {
        ask(res, 'PREQUAL_currentPropertyValueAmount');
      }
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_propertyPurchaseAmount',
    slotType: 'CURRENCY',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    question: `What's the purchase price for the property?`,
    successCallback: (res: hubot.Response, propertyPurchaseAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyPurchaseAmount = propertyPurchaseAmount;

      ask(res, 'PREQUAL_propertyLoanAmount');
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_currentPropertyValueAmount',
    slotType: 'CURRENCY',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    question: `How much is your property worth?`,
    successCallback: (res: hubot.Response, currentPropertyValueAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.currentPropertyValueAmount = currentPropertyValueAmount;

      ask(res, 'PREQUAL_propertyLoanAmount');
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_propertyLoanAmount',
    slotType: 'CURRENCY',
    utterances: [
      '{Slot}',
      '${Slot}'
    ],
    question: `And how much financing are you looking for?`,
    successCallback: (res: hubot.Response, propertyLoanAmount: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.propertyLoanAmount = propertyLoanAmount;

      const kickout = loanApp.financingKickout;

      // Do some early kickouts.
      if (kickout) {
        res.send(KICKOUT_MESSAGES[kickout]);
        return;
      } else {
        ask(res, 'PREQUAL_borrowerFicoScore');
      }
    }
  });

  registerPrequalQuestion({
    name: 'PREQUAL_borrowerFicoScore',
    slotType: 'NUMBER',
    question: `Looks good! One more question, what's your estimated FICO score?`,
    successCallback: (res: hubot.Response, borrowerFicoScore: number) => {
      const loanApp = loanApps.get(res.message.user.id);
      loanApp.borrowerFicoScore = borrowerFicoScore;

      const kickout = loanApp.validateFico();

      if (kickout) {
        res.send(KICKOUT_MESSAGES[kickout]);
        return;
      }

      const rateOrKickout: number | string = loanApp.engine.getRate();

      if (_.isString(rateOrKickout)) {
        res.send(KICKOUT_MESSAGES[rateOrKickout]);
      } else {
        const rate: number = rateOrKickout * 100;
        res.send(`Congratulations, you are preapproved for a ${rate}% loan! Go to https://assetavenue.com/prequal/bridge-application to finish your application.`);
      }
    }
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

  /** FULL PREQUAL */
  nlc.registerIntent({
    intent: 'PREQUAL_FULL',
    slots: [
      {
        name: 'zip',
        type: 'PREQUAL_ZIP'
      },
      {
        name: 'state',
        type: 'WORD'
      },
      {
        name: 'loanPurposeType',
        type: 'LOAN_PURPOSE_TYPE'
      },
      {
        name: 'propertyValue',
        type: 'CURRENCY'
      },
      {
        name: 'propertyLoanAmount',
        type: 'CURRENCY'
      },
      {
        name: 'borrowerFicoScore',
        type: 'NUMBER'
      }
    ],
    utterances: [
      'price a bridge {loanPurposeType} loan in {zip} {state} for {propertyLoanAmount} of {propertyValue} with {borrowerFicoScore} fico',
      'price a bridge {loanPurposeType} loan in {zip} {state} for {propertyLoanAmount} of {propertyValue} with a {borrowerFicoScore} fico',
      'price a bridge {loanPurposeType} loan in {zip} {state} for {propertyLoanAmount} of {propertyValue} with an {borrowerFicoScore} fico',
      'price a bridge {loanPurposeType} loan in {zip}, {state} for {propertyLoanAmount} of {propertyValue} with {borrowerFicoScore} fico',
      'price a bridge {loanPurposeType} loan in {zip}, {state} for {propertyLoanAmount} of {propertyValue} with a {borrowerFicoScore} fico',
      'price a bridge {loanPurposeType} loan in {zip}, {state} for {propertyLoanAmount} of {propertyValue} with an {borrowerFicoScore} fico',
    ],
    callback: (
      res: hubot.Response,
      propertyPostalCode: string,
      propertyState: string,
      loanPurposeType: string,
      propertyValue: number,
      propertyLoanAmount: number,
      borrowerFicoScore: number
    ) => {
      const loanApp = new BridgeLoanApplication(robot);
      loanApp.propertyPostalCode = propertyPostalCode;
      loanApp.propertyState = propertyState;
      loanApp.loanPurposeType = loanPurposeType;
      loanApp.propertyValue = propertyValue;
      loanApp.propertyLoanAmount = propertyLoanAmount;
      loanApp.borrowerFicoScore = borrowerFicoScore;

      const kickouts = loanApp.kickouts;

      if (kickouts) {
        res.send(`kickouts: ${kickouts.join(', ')}`);
        return;
      }

      loanApp.engine.loadBaseRate()
        .then(() => {
          const rate = loanApp.engine.getRate();

          if (_.isString(rate)) {
            res.send(`kickouts: ${rate}`);
          } else {
            res.send(`rate: ${loanApp.engine.getRate()}\nltv: ${loanApp.loanToValue}`);
          }
        })
        .catch((kickout: string) => {
          res.send(`kickouts: ${kickout}`);
        });
    }
  });
};
