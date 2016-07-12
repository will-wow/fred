import _ = require('lodash');

class ApiUtils {
  constructor(
    private robot: hubot.Robot
  ) {

  }

  get(url: string): Promise<any> {
    return new Promise((resolve, reject): void => {
      this.robot.http(url)
      .get()(this.getBodyParser(resolve, reject));
    });
  }

  post(url: string, body?: any) {
    return new Promise((resolve, reject): void => {
      this.robot.http(url)
      .post(body)(this.getBodyParser(resolve, reject));
    });
  }

  put(url: string, body?: any) {
    return new Promise((resolve, reject): void => {
      this.robot.http(url)
      .put(body)(this.getBodyParser(resolve, reject));
    });
  }

  delete(url: string) {
    return new Promise((resolve, reject): void => {
      this.robot.http(url)
      .delete()(this.getBodyParser(resolve, reject));
    });
  }

  private getBodyParser(resolve, reject) {
    return (error, res, body) => {
      // Handle server error.
      if (error) {
        let parsedError: string;

        try {
          parsedError = JSON.parse(error);
        }
        catch (e) {
          // Send error directly if not parsable.
          reject(error);
          return;
        }

        // Reject with parsed error info.
        reject(parsedError);
        return;
      }

      // Resolve with body.
      resolve(this.parseJson(body));
    };
  }

  private parseJson(body: string): any {
    let parsedBody: any;

    try {
      parsedBody = JSON.parse(body);
    }
    catch (error) {
      // If not JSON, maybe it's a number?
      let numberBody = _.toNumber(body);

      // Use the number or string.
      parsedBody = isNaN(numberBody) ? body : numberBody;
    }

    return parsedBody;
  }
}

export default ApiUtils;
