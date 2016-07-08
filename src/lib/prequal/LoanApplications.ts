import BridgeLoanApplication from './BridgeLoanApplication';

class LoanApplications {
  private active: { [userId: string]: BridgeLoanApplication };

  constructor(
    private robot: hubot.Robot
  ) {
    this.active = {};
  }

  /**
   * Create a new app for a user, and return it.
   * @param userId - A unique id for the user.
   * @returns the new application
   */
  public create(userId: string): BridgeLoanApplication {
    const loanApp: BridgeLoanApplication = new BridgeLoanApplication(this.robot);

    this.active[userId] = loanApp;

    return loanApp;
  }

  /**
   * Get an existing loanApp for a user.
   * @param userId - A unique id for the user.
   * @returns the application
   */
  public get(userId: string): BridgeLoanApplication {
    return this.active[userId];
  }
}

export default LoanApplications;
