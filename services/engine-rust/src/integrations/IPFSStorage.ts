// integrations/IPFSStorage.ts

import { create, IPFSHTTPClient } from 'ipfs-http-client';

export class IPFSStorage {
  private ipfs: IPFSHTTPClient;

  constructor() {
    // Connect to a local or remote IPFS node
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' });
  }

  async store(data: Buffer): Promise<string> {
    const result = await this.ipfs.add(data);
    return result.cid.toString();
  }

  async retrieve(cid: string): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}