import KeyPair from "./KeyPair";
import SignedMessage from "./SignedMessage";

// A client that handles interaction with the blockchain nodes.
export default class Client {
  // Create a new client with the provided keypair.
  // If no keypair is provided, use a random one.
  constructor(keyPair) {
    if (!keyPair) {
      this.keyPair = KeyPair.fromRandom();
    } else {
      this.keyPair = keyPair;
    }
  }

  // Sends a message upstream, signing with our keypair.
  // Returns a promise for the response message.
  // All the signing and signature-checking is here; callers don't need to handle it.
  async sendMessage(message) {
    let clientMessage = SignedMessage.fromSigning(message, this.keyPair);
    let url = "http://localhost:8000/messages";
    let body = clientMessage.serialize() + "\n";
    let response = await fetch(url, {
      method: "post",
      body: body
    });
    let text = await response.text();
    // TODO: sanely handle a bad message from the server
    let serverMessage = SignedMessage.fromSerialized(text);
    return serverMessage.message;
  }

  // Sends a query message.
  // Returns a promise for a message - a data message if the query worked, an error
  // message if it did not.
  async query(message) {
    let queryMessage = {
      Type: "Query",
      Message: message
    };
    return this.sendMessage(queryMessage);
  }
}
