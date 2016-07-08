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

  engine: BridgeEngine;

  constructor(robot: hubot.Robot) {
    this.engine = new BridgeEngine(robot, this);
  }

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
  get isBelowLoanMin() {
    return this.propertyLoanAmount <= this.loanMax;
  }

  get isAboveLoanMax() {
    return this.propertyLoanAmount >= this.loanMin;
  }
}

export default BridgeLoanApplication;
