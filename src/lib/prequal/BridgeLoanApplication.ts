import BridgeEngine from './BridgeEngine';

class BridgeLoanApplication {
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

  get isPurchase(): boolean {
    return this.loanPurposeType === 'purchase';
  }

  get isRefi(): boolean {
    return this.loanPurposeType === 'refinance';
  }
}

export default BridgeLoanApplication;
