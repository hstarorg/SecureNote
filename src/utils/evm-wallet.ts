import { getAddress, hexToNumber } from 'viem';
import { customAlphabet } from 'nanoid';

export type SignResult = {
  message: string;
  signature: string;
  [key: string]: any;
};

class EvmWallet {
  private provider: any;

  public chainId: number = 0;
  public address: string = '';

  init(): void {
    if ('ethereum' in window) {
      const provider = window.ethereum;
      this.provider = provider;
    } else {
      window.open('https://metamask.io/', `_blank`);
    }
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

  async signByEIP4361(statement: string): Promise<SignResult> {
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
      signature: sign,
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
}

export const evmWallet = new EvmWallet();
