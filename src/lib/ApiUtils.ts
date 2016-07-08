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
    return (error, getRes, body) => {
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

      let parsedBody: any;

      try {
        parsedBody = JSON.parse(body);
      }
      catch (error) {
        // handle JSON error
        reject(error);
        return;
      }

      // Resolve with body.
      resolve(parsedBody);
    };
  }
}

export default ApiUtils;
