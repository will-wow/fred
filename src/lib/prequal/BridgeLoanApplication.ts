import _ = require('lodash');

import BridgeEngine from './BridgeEngine';

class BridgeLoanApplication {
  // Loan Data
  propertyState: string;
  propertyPostalCode: string;
  productType: string = 'bridge';
  loanPurposeType: string;
  propertySubtype: string;
  propertyPurchaseAmount: number;
  desiredPropertyLoanAmount: number;
  borrowerFicoScore: number;
  currentPropertyValueAmount: number;
  additionalCashOutAmount: number;

  // constants
  loanMin: number = 75000;
  loanMax: number = 2000000;
  ficoMin: number = 650;
  ficoMax: number = 850;
  ltvMax: number = 0.75;

  engine: BridgeEngine;

  public static KICKOUT_CODES = {
    loan_amount_exceeded: 'loan_amount_exceeded',
    loan_below_minimum: 'loan_below_minimum',
    bad_credit: 'bad_credit',
    super_credit: 'super_credit',
    high_ltv: 'high_ltv'
  };

  private _kickouts: string[];

  constructor(robot: hubot.Robot) {
    this.engine = new BridgeEngine(robot, this);
    this._kickouts = [];
  }

  // Loan Formulas.
  get loanToValue(): number {
    let result: number;

    switch (this.loanPurposeType) {
      case "purchase":
        result = this.desiredPropertyLoanAmount / this.propertyPurchaseAmount;
        break;
      case "refinance":
        result = this.additionalCashOutAmount / this.currentPropertyValueAmount;
        break;
    }

    return result;
  }

  get propertyLoanAmount(): number {
    if (this.isPurchase) {
      return this.desiredPropertyLoanAmount;
    } else {
      return this.additionalCashOutAmount;
    }
  }

  set propertyLoanAmount(loanAmount: number) {
    if (this.isPurchase) {
      this.desiredPropertyLoanAmount = loanAmount;
    } else {
      this.additionalCashOutAmount = loanAmount;
    }
  }

  get isPurchase(): boolean {
    return this.loanPurposeType === 'purchase';
  }

  get isRefi(): boolean {
    return this.loanPurposeType === 'refinance';
  }

  // Validators

  /**
   * A kickout for the loan, if any.
   */
  get kickout(): string {
    this._kickouts = [];

    this.validateFico();
    this.validateIsAboveLoanMax();
    this.validateIsBelowLoanMin();
    this.validateLoanToValue();

    return this._kickouts.length ? this._kickouts[0] : undefined;
  }

  /**
   * Kickouts only for financing.
   */
  get financingKickout(): string {
    this._kickouts = [];

    this.validateIsAboveLoanMax();
    this.validateIsBelowLoanMin();
    this.validateLoanToValue();

    return this._kickouts.length ? this._kickouts[0] : undefined;
  }

  validateFico() {
    if (this.borrowerFicoScore < this.ficoMin) {
      return this.doKickout(BridgeLoanApplication.KICKOUT_CODES.bad_credit);
    } else if (this.borrowerFicoScore > this.ficoMax) {
      return this.doKickout(BridgeLoanApplication.KICKOUT_CODES.super_credit);
    }
  }

  private validateLoanToValue(): string {
    if (this.loanToValue > this.ltvMax) {
      return this.doKickout(BridgeLoanApplication.KICKOUT_CODES.high_ltv);
    }
  }

  private validateIsBelowLoanMin(): string {
    if (this.propertyLoanAmount <= this.loanMin) {
      return this.doKickout(BridgeLoanApplication.KICKOUT_CODES.loan_below_minimum);
    }
  }

  private validateIsAboveLoanMax() {
    if (this.propertyLoanAmount >= this.loanMax) {
      return this.doKickout(BridgeLoanApplication.KICKOUT_CODES.loan_amount_exceeded);
    }
  }

  /**
   * Both record a kickout in the _kickouts array, and return it.
   */
  private doKickout(kickout: string) {
    this._kickouts.push(kickout);
    return kickout;
  }
}

export default BridgeLoanApplication;
