import _ = require('lodash');

import {V2_URL} from './config';
import ApiUtils from '../ApiUtils';
import BridgeLoanApplication from './BridgeLoanApplication';

interface IBridgeLtvRatesTable {
  [ltv: number]: number;
}

interface IBridgeRateTable {
  [fico: number]: IBridgeLtvRatesTable;
}

const RATE_MINIMUM: number = 0.095;

/** Represents the logic for the prequal engine for bridge loans */
class BridgeEngine {
  /**
   * If the engine's baserate should be considered good to use.
   */
  public ratesAreLive: boolean;
  /** The current kickout code. */
  public kickout: string;
  /** The current baseRate number. */
  public baseRate: number;

  private api: ApiUtils;

  /** The rate table. Valid for the lifetime of the webapp. */
  private static rateTable: IBridgeRateTable;
  /** Holds the promise from the first request for the table. */
  private static rateTablePromise: Promise<IBridgeRateTable>;

  constructor(
    robot: hubot.Robot,
    private loanApp: BridgeLoanApplication
  ) {
    this.api = new ApiUtils(robot);
  }

  /**
   * Get the base rate adjustment for the app's zip code.
   * Also pulls down the rate table, if it hasn't been already.
   * @returns the rate adjustment in a promise.
   */
  loadBaseRate(): Promise<number | string> {
    return this.updateRateTable()
      .then(() => {
        return this.api.get(V2_URL + `bridge/rate_adjustment?zip=${this.loanApp.propertyPostalCode}&state=${this.loanApp.propertyState}`);
      })
      .then((baseRate: number) => {
        this.baseRate = baseRate;
        this.kickout = undefined;
        this.ratesAreLive = true;
        return baseRate;
      })
      .catch((kickouts: string[]) => {
        this.baseRate = undefined;
        this.kickout = kickouts[0];
        this.ratesAreLive = false;
        return Promise.reject(this.kickout);
      });
  }

  /**
   * Get the rate for the current loan.
   * @returns the rate as a number, or a kickout as a string.
   */
  getRate(): number | string {
    const ltv = this.loanApp.loanToValue;
    const fico = this.loanApp.borrowerFicoScore;

    // Find the FICO table for the LTV
    const ltvTable: IBridgeLtvRatesTable = this.getColumnInRange(fico, BridgeEngine.rateTable, false);

    // Kickout for bad fico.
    if (!ltvTable) {
      return 'bridge_bad_credit';
    }

    // Find the rate for the FICO.
    const rate: number = this.getColumnInRange(ltv, ltvTable, true);

    // Kickout for bad ltvs.
    if (!rate) {
      return 'max_ltv';
    }

    // Add the base rate adjustment in, and cap the rate at the RATE_MINIMUM.
    return _.max([rate + this.baseRate, RATE_MINIMUM]);
  }

  /**
   * Mark the baseRate as not live.
   */
  killBaseRate(): void {
    this.ratesAreLive = false;
  }

  /**
   * For a given value and a table where the keys are tops or bottoms (inclusive)
   * of ranges, find the table column that the value is in range for.
   * @param value - The value to check
   * @param table - The range table. Can be an IBridgeLtvRatesTable or IBridgeRateTable.
   * @param lookDown - if true, the values represent the top of ranges. Otherwise the bottom.
   * @returns the matching column from the table.
   */
  private getColumnInRange(value: number, table: Object, lookDown: boolean) {
    // Get the keys of the object, in order. If not lookDown, order descending.
    const keys: number[] = _.chain(table)
      .keys()
      // Keys come in as strings, because JSON.
      .map(_.toNumber)
      .orderBy(_.identity, lookDown ? 'asc' : 'desc')
      .value();

    /** The column the value was in the range of. */
    let inRangeColumn: any;

    _.forEach(keys, (key: number, index: number) => {
      if (lookDown && value <= key || !lookDown && value >= key) {
        // Use the key's value.
        inRangeColumn = table[key];
        // Break.
        return false;
      }
    });

    // Return the column the value was in range for. If the value was too low,
    // will be undefined.
    return inRangeColumn;
  }

  /**
   *  Update the static rate table, but only once.
   */
  private updateRateTable(): Promise<IBridgeRateTable> {

    if (!BridgeEngine.rateTablePromise) {
      // Get the rate table, and store it until a browser reload.
      BridgeEngine.rateTablePromise = this.api.get(V2_URL + `bridge/rate_matrix`)
        .then((rateTable) => BridgeEngine.rateTable = rateTable);
    }

    // Return the rate table in a promise. If the request is already done
    // or going out, this will already be resolved.
    return BridgeEngine.rateTablePromise;
  }
}

export default BridgeEngine;
