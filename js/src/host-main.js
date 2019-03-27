// This is the entry point for the hosting server.

// TODO: make this read args and create a HostingServer

const http = require("http");
const path = require("path");

const Tracker = require("bittorrent-tracker");
const WebTorrent = require("webtorrent-hybrid");

// Run a black hole proxy
const BlackHoleProxy = require("./BlackHoleProxy.js");
let proxy = new BlackHoleProxy(3333);

// Run a webtorrent tracker
// See https://github.com/webtorrent/bittorrent-tracker for docs
let server = new Tracker.Server({
  udp: true,
  http: true,
  ws: true,
  stats: true,
  filter: (infoHash, params, callback) => {
    // Allow tracking all torrents
    // TODO: restrict this in a logical way
    callback(null);
  }
});
server.on("listening", () => {
  // fired when all requested servers are listening
  console.log("tracker listening on http port:" + server.http.address().port);
  console.log("tracker listening on udp port:" + server.udp.address().port);
});
server.listen(4444, "localhost");

// TODO: remove this webtorrent seeding once the deploy-based seeding is working
// Seed a WebTorrent
let client = new WebTorrent();
let dir = path.resolve(__dirname, "samplesite");
client.seed(dir, torrent => {
  console.log("info hash: " + torrent.infoHash);

  torrent.on("wire", (wire, addr) => {
    console.log("connected to peer with address", addr);
  });
});
