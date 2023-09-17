import { getAddress, hexToNumber } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  encryptWithPublicKey,
  decryptWithPrivateKey,
  cipher,
} from 'eth-crypto';
import { customAlphabet } from 'nanoid';

export type SignResult = {
  message: string;
  signature: `0x${string}`;
  [key: string]: any;
};

class EvmWallet {
  private provider: any;

  public chainId: number = 0;
  public address: string = '';

  private init(): void {
    if ('ethereum' in window) {
      const provider = window.ethereum;
      this.provider = provider;
    } else {
      window.open('https://metamask.io/', `_blank`);
    }
  }

  getPublicKey(privateKey: `0x${string}`): string {
    const account = privateKeyToAccount(privateKey);
    return account.publicKey;
  }

  getAddress(address: string) {
    return getAddress(address);
  }

  async connect(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    const accounts = await this.provider.request({
      method: 'eth_requestAccounts',
    });
    const chainIdHex = await this.provider.request({
      method: 'eth_chainId',
      params: [],
    });

    this.chainId = hexToNumber(chainIdHex);
    this.address = getAddress(accounts[0]);

    return true;
  }

  private getNonce() {
    return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789')(12);
  }

  private async initAndConnect() {
    this.init();
    await this.connect();
  }

  async signByEIP4361(statement: string): Promise<SignResult> {
    await this.initAndConnect();
    const loginMsg = {
      domain: location.host,
      chainId: this.chainId,
      origin: location.origin,
      issuedAt: new Date().toISOString(),
      version: '1',
      nonce: this.getNonce(),
      statement,
      signType: 'EIP-4361',
      address: evmWallet.address,
    };
    return this.sign(JSON.stringify(loginMsg));
  }

  async sign(message: string): Promise<SignResult> {
    const msgData = JSON.parse(message);
    const fullMessage =
      msgData.signType === 'EIP-4361'
        ? this.to4361Message({
            domain: msgData.domain,
            chainId: msgData.chainId || '',
            uri: msgData.origin,
            issuedAt: msgData.issuedAt,
            version: msgData.version,
            nonce: msgData.nonce,
            statement: msgData.statement,
            address: msgData.address,
          })
        : message;
    const sign = await this.provider.request({
      method: 'personal_sign',
      params: [fullMessage, this.address],
    });
    return {
      message: fullMessage,
      signature: sign as `0x${string}`,
    };
  }

  // EIP-4361 formated message, ready for EIP-191 signing.
  private to4361Message({
    domain,
    version,
    nonce,
    issuedAt,
    statement,
    chainId,
    uri,
    address,
  }: {
    domain: string;
    version: string;
    nonce: string;
    issuedAt: string;
    statement: string;
    chainId: number;
    uri: string;
    address: string;
  }): string {
    const header = `${domain} wants you to sign in with your Ethereum account:`;
    const uriField = `URI: ${uri}`;
    let prefix = [header, address].join('\n');
    const versionField = `Version: ${version}`;

    // const addressField = `Address: ` + address;

    const chainField = `Chain ID: ` + chainId || '1';

    const nonceField = `Nonce: ${nonce}`;

    const suffixArray = [uriField, versionField, chainField, nonceField];

    suffixArray.push(`Issued At: ${issuedAt}`);

    const suffix = suffixArray.join('\n');
    prefix = [prefix, statement].join('\n\n');
    if (statement) {
      prefix += '\n';
    }
    return [prefix, suffix].join('\n');
  }

  async signByEIP712(message: string): Promise<SignResult> {
    await this.initAndConnect();
    const sign = await this.provider.request({
      method: 'eth_signTypedData_v4',
      params: [this.address, message],
    });
    return {
      message,
      signature: sign,
    };
  }

  /**
   * Shorten wallet address
   * @param address wallet address
   * @param size if size is 'normal', the address will be shorten to 8...8, if size is 'shorter', the address will be shorten to 5...3
   * @returns
   */
  shortenWalletAddress(address: string, size: 'normal' | 'shorter'): string {
    if (size === 'shorter') {
      if (address.length <= 8) {
        return address;
      }
      return `${address.slice(0, 5)}...${address.slice(-4)}`;
    } else if (size === 'normal') {
      if (address.length <= 16) {
        return address;
      }
      return `${address.slice(0, 8)}...${address.slice(-8)}`;
    }
    return address;
  }

  async encryptWithPublicKey(text: string, pubKey: string) {
    const finalPubKey = pubKey.startsWith('0x') ? pubKey.slice(2) : pubKey;
    const encrypted = await encryptWithPublicKey(finalPubKey, text);
    const result = cipher.stringify(encrypted);
    return result;
  }

  async decryptWithPrivateKey(text: string, privateKey: string) {
    const encrypted = cipher.parse(text);
    return await decryptWithPrivateKey(privateKey, encrypted);
  }

  async getIdentityByWallet(seed: string) {
    const signResult = await evmWallet.signByEIP712(
      JSON.stringify({
        types: {
          EIP712Domain: [{ name: 'name', type: 'string' }],
          Info: [{ name: 'seed', type: 'string' }],
        },
        primaryType: 'Info',
        domain: {
          name: 'Secure Note',
        },
        message: {
          seed,
        },
      })
    );
    const privateKey = signResult.signature.slice(0, 66) as `0x${string}`;
    const publicKey = evmWallet.getPublicKey(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }
}

export const evmWallet = new EvmWallet();
