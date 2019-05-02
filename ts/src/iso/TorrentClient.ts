// A wrapper around the WebTorrent client with an async API.

import WebTorrent = require("webtorrent-hybrid");

import NetworkConfig from "../iso/NetworkConfig";
import Torrent from "./Torrent";

function nicePeerId(id) {
  return "_" + ("" + id).slice(-4);
}

export default class TorrentClient {
  client: WebTorrent;
  verbose: boolean;
  trackers: string[];

  constructor(network: string) {
    let config = new NetworkConfig(network);
    this.trackers = config.trackers;

    this.client = new WebTorrent();
    this.client.on("error", err => {
      console.log("fatal error in TorrentClient:", err.message);
    });
    this.verbose = false;
  }

  log(...args) {
    if (this.verbose) {
      console.log(...args);
    }
  }

  // Call on a raw WebTorrent object, not a wrapped Torrent
  logTorrentEvents(torrent) {
    torrent.on("metadata", () => {
      this.log("metadata acquired for", torrent.magnetURI);
    });
    torrent.on("warning", err => {
      this.log("warning:", err.message);
    });
    torrent.on("wire", (wire, addr) => {
      let pid = nicePeerId(wire.peerId);
      this.log("connected to", pid, "at", addr);

      wire.on("interested", () => {
        this.log(pid, "got interested");
      });
      wire.on("uninterested", () => {
        this.log(pid, "got uninterested");
      });
      wire.on("choke", () => {
        this.log(pid, "is choking us");
      });
      wire.on("unchoke", () => {
        this.log(pid, "is no longer choking us");
      });
      wire.on("request", (index, offset, length) => {
        this.log(pid, "requests", index, offset, length);
      });
    });
    torrent.on("error", err => {
      this.log("torrent error:", err.message);
    });
  }

  // Returns an array of Torrent objects
  getTorrents() {
    let answer = [];
    for (let t of this.client.torrents) {
      answer.push(new Torrent(t));
    }
    return answer;
  }

  // Returns a Torrent object
  async seed(directory): Promise<any> {
    let promise = new Promise((resolve, reject) => {
      this.client.seed(
        directory,
        {
          announceList: [this.trackers]
        },
        torrent => {
          this.logTorrentEvents(torrent);
          resolve(new Torrent(torrent, this.verbose));
        }
      );
    });
    return await promise;
  }

  // Returns a Torrent object for downloading this magnet url.
  // Continues seeding this after the download is complete.
  // path is an optional path on disk to use.
  // Does not wait for the download to complete before returning.
  // If you want that, call waitForDone.
  download(magnet, path?) {
    // First, check if this download is already in progress.
    for (let t of this.client.torrents) {
      if (t.magnetURI == magnet) {
        return new Torrent(t, this.verbose);
      }
    }

    // Add a new download
    let options = { path: undefined };
    if (path) {
      options.path = path;
    }
    let t = this.client.add(magnet, options);
    this.log("downloading", magnet);
    this.logTorrentEvents(t);
    return new Torrent(t, this.verbose);
  }

  // Stops downloading a torrent.
  // Accepts either a magnet URL or an infoHash
  async remove(id) {
    let promise = new Promise((resolve, reject) => {
      this.client.remove(id, err => {
        if (err) {
          this.log("error in remove:", err.message);
        }
        resolve();
      });
    });
    return await promise;
  }

  // Shuts down the torrent client.
  async destroy() {
    let promise = new Promise((resolve, reject) => {
      this.client.destroy(err => {
        resolve(null);
      });
    });
    return await promise;
  }
}
