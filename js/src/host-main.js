// This is the entry point for the hosting server.

// TODO: make this read args and create a HostingServer

const http = require("http");
const path = require("path");

// const Tracker = require("bittorrent-tracker");
const WebTorrent = require("webtorrent-hybrid");

// Run a black hole proxy
const BlackHoleProxy = require("./BlackHoleProxy.js");
let proxy = new BlackHoleProxy(3333);

// Run a tracker
const Tracker = require("./Tracker.js");
let tracker = new Tracker(4444);

// TODO: remove this webtorrent seeding once the deploy-based seeding is working
// Seed a WebTorrent
let client = new WebTorrent();
let dir = path.resolve(__dirname, "samplesite");
client.seed(
  dir,
  {
    announceList: [["ws://localhost:4444"]]
  },
  torrent => {
    console.log("seeding torrent.");
    console.log("info hash: " + torrent.infoHash);
    console.log("magnet: " + torrent.magnetURI);

    torrent.on("wire", (wire, addr) => {
      console.log("connected to peer with address", addr);
    });
  }
);
