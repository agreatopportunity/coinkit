const ChainClient = require("./ChainClient.js");
const { sleep } = require("./Util.js");

// The ProviderListener continuously tracks information relevant to a single provider.
// This is designed to be the source of information for a hosting server.
class ProviderListener {
  constructor(verbose) {
    this.client = new ChainClient();
    this.verbose = !!verbose;
    this.bucketsCallback = null;
  }

  log(...args) {
    if (this.verbose) {
      console.log(...args);
    }
  }

  onBuckets(f) {
    this.bucketsCallback = f;
  }

  handleBuckets(buckets) {
    if (this.bucketsCallback) {
      this.bucketsCallback(buckets);
    }
  }

  // Listens forever
  async listen(id) {
    // buckets maps bucket name to information about the bucket
    let buckets = {};

    while (true) {
      let bucketList = await this.client.getBuckets({ provider: id });
      this.handleBuckets(bucketList);

      await sleep(2000);
    }
  }
}

module.exports = ProviderListener;
