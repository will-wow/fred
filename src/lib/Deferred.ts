class Deferred {
  public resolve: Function;
  public reject: Function;
  public promise: Promise<any>;

  constructor () {
    this.promise = new Promise ((resolve: Function, reject: Function) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export default Deferred;