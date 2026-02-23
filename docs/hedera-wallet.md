# Create a Hedera DApp Integrated with WalletConnect

> In the dynamic world of decentralized applications (DApps), catering to users with diverse wallet preferences is important.

Explore DApp development using the Mirror Node API and Hedera Token Service (HTS). Discover how to integrate HTS functionality into your DApp for seamless token management and transactions. This guide uses React, Material UI, Ethers, and TypeScript with the [Create React App (CRA) Hedera DApp template](https://github.com/hedera-dev/cra-hedera-dapp-template) integrated with WalletConnect, streamlining your development process.

## What you will accomplish

* [ ] Query the mirror node for account token balance, token information, and Non-fungible information.
* [ ] Query the mirror node to check if the receiver has associated with a token ID
* [ ] Associate an HTS token with [HashPack](https://www.hashpack.app/), [Kabila](https://www.kabila.app/wallet), [Blade](http://bladewallet.io/), or [MetaMask](https://metamask.io/) through a UI
* [ ] Transfer an HTS token through a UI

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=d85ff98594b2bed362eeffd0427b65d7" data-og-width="2999" width="2999" data-og-height="758" height="758" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=1e169b66a66af844591adfbef9add4b2 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=23a5afcc9b74675ad09c55a46d34e170 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e673454198479058b383f58b9632ca54 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=5446023b0d71e3797fb1dfd52ba55b55 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=c8ae17b5ff84943ed7af565affe84219 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-1.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=cf85096a73956b11491567cf6240595e 2500w" />
</Frame>

## Prerequisites

Before you begin, you should be familiar with the following:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [TypeScript](https://www.typescriptlang.org/)
* [React](https://react.dev/)
* [REST API](https://www.geeksforgeeks.org/rest-api-introduction/)

<Accordion title="Also, you should have the following set up on your computer ⬇">
  - [x] `git` installed
    * Minimum version: 2.37
    * Recommended: [Install Git (Github)](https://github.com/git-guides/install-git)
  - [x] A code editor or IDE
    * Recommended: [VS Code. Install VS Code (Visual Studio)](https://code.visualstudio.com/docs/setup/setup-overview)
  - [x] NodeJs + npm installed
    * Minimum version of NodeJs: 18
    * Minimum version of npm: 9.5
    * Recommended for Linux & Mac: [nvm](https://github.com/nvm-sh/nvm)
    * Recommended for Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
</Accordion>

<Accordion title="Check your prerequisites set up ⬇">
  Open your terminal, and enter the following commands.

  ```shell  theme={null}
  git --version
  code --version
  node --version
  npm --version
  ```

  Each of these commands should output some text that includes a version number, for example:

  ```
  git --version
  git version 2.39.2 (Apple Git-143)

  code --version
  1.81.1
  6c3e3dba23e8fadc360aed75ce363ba185c49794
  arm64

  node --version
  v20.6.1

  npm --version
  9.8.1
  ```

  If the output contains text similar to `command not found`, please install that item.
</Accordion>

## Get Started

We choose to scaffold our project by using the [CRA Hedera DApp template](https://github.com/hedera-dev/cra-hedera-dapp-template), as it offers:

* [x] Multi-wallet integration via walletconnect supporting MetaMask and Hedera native wallets
* [x] Mirror Node Client
* [x] State management via React Context
* [x] Material UI
* [x] Choice of TypeScript or JavaScript

This custom template eliminates setup overhead and allows you to dive straight into the core features of your project.

<Accordion title="Template Project Repos">
  The complete TypeScript project can be found on GitHub [here](https://github.com/a-ridley/hbar-faucet-for-metamask).

  The complete JavaScript project can be found on GitHub [here](https://github.com/a-ridley/hbar-faucet-for-metamask-JS).
</Accordion>

### 1. Scaffold your project

Open a terminal and run the following command to set up your project structure, replacing `my-app-name` with your desired directory name.

```shell  theme={null}
npx create-react-app <my-app-name> --template git+ssh://git@github.com/hedera-dev/cra-hedera-dapp-template.git
```

<Accordion title="Scaffolding project expected output">
  <Frame>
    <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=dfe2ad19d09fd67ea44570ade36b6e0f" data-og-width="2313" width="2313" data-og-height="2844" height="2844" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=ebd2523f456e0ffefa109ceb8b832c8c 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=665587d395aa97599e7cf9d1c519820b 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=725bf80e039773b529e71745dbaf6df5 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=6cfba2f3ce5217310ecfb8ae882e5e33 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7949d17f2fa5ab0d30676eb848476da1 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-2.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=48f0b420a32ce4e484be7e4ea58381c9 2500w" />
  </Frame>
</Accordion>

Open your newly created react app project with visual studio code. You should see the following file structure.

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0a964bd50c5cf5f554c23ac843a4e303" data-og-width="391" width="391" data-og-height="298" height="298" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=6b9265b0664e9bcef6c8100ffe110069 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e655fe23f964c662444ea0f24ebf3fed 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b7e07cacc36f518e1223e1dabe3c3477 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=6242e0dca024eb543b50ffe20a7e5a6a 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=be68d3fc66f2228bceb6730a9f6aa6a3 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-3.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=a0de5347e3e476f3ba319fd5bcd1b01a 2500w" />
</Frame>

### 2. Fetching Token Data: Writing Mirror Node API Queries

[Mirror nodes](/hedera/core-concepts/mirror-nodes) offer access to historical data from the Hedera network while optimizing the use of network resources. You can easily retrieve information like transactions, records, events, and balances. Visit the [mirror node API docs](https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/getAccountByIdOrAliasOrEvmAddress) to learn more.

In vscode open the file located at `src/services/wallets/mirrorNodeClient.ts`.

This file creates a mirror node client and is used to fetch data from the mirror nodes. We will add new code to help us obtain information about the tokens we currently own.

<Info>
  This client is configured for the Hedera Testnet. For further configuration, go to `src/config/network.ts.`
</Info>

#### 2.1 Query Account Token Balances by Account ID

We'll use the Mirror Node API to query information about the tokens we currently own and the quantities of those tokens.

Open `src/services/wallets/mirrorNodeClient.ts` and paste the below interface outside of and above the `MirrorNodeClient` class.

```typescript  theme={null}
export interface MirrorNodeAccountTokenBalance {
  balance: number,
  token_id: string,
}
```

<Info>
  This interface defines the data fields we need for our DApp, filtering out any extra data from the mirror node response.
</Info>

Paste the below HTTP GET request outside of and below the `MirrorNodeClient` class in the `src/services/wallets/mirrorNodeClient.ts` file.

```typescript  theme={null}
 // Purpose: get token balances for an account
 // Returns: an array of MirrorNodeAccountTokenBalance
 async getAccountTokenBalances(accountId: AccountId) {
   // get token balances
   const tokenBalanceInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}/tokens?limit=100`, { method: "GET" });
   const tokenBalanceInfoJson = await tokenBalanceInfo.json();

   const tokenBalances = [...tokenBalanceInfoJson.tokens] as MirrorNodeAccountTokenBalance[];

   // because the mirror node API paginates results, we need to check if there are more results
   // if links.next is not null, then there are more results and we need to fetch them until links.next is null
   let nextLink = tokenBalanceInfoJson.links.next;
   while (nextLink !== null) {
     const nextTokenBalanceInfo = await fetch(`${this.url}${nextLink}`, { method: "GET" });
     const nextTokenBalanceInfoJson = await nextTokenBalanceInfo.json();
     tokenBalances.push(...nextTokenBalanceInfoJson.tokens);
     nextLink = nextTokenBalanceInfoJson.links.next;
   }

   return tokenBalances;
 }
```

<Accordion title="File Checkpoint">
  To ensure you're on the right track, your \`src/services/wallets/mirrorNodeClient.ts\` file should look like below.

  ```typescript  theme={null}
  import { AccountId } from "@hashgraph/sdk";
  import { NetworkConfig } from "../../config";

  export interface MirrorNodeAccountTokenBalance {
    balance: number,
    token_id: string,
  }

  export class MirrorNodeClient {
    url: string;
    constructor(networkConfig: NetworkConfig) {
      this.url = networkConfig.mirrorNodeUrl;
    }

   // Purpose: get token balances for an account
   // Returns: an array of MirrorNodeAccountTokenBalance
   async getAccountTokenBalances(accountId: AccountId) {
    // get token balances
    const tokenBalanceInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}/tokens?limit=100`, { method: "GET" });
    const tokenBalanceInfoJson = await tokenBalanceInfo.json();

    const tokenBalances = [...tokenBalanceInfoJson.tokens] as MirrorNodeAccountTokenBalance[];

    // because the mirror node API paginates results, we need to check if there are more results
    // if links.next is not null, then there are more results and we need to fetch them until links.next is null
    let nextLink = tokenBalanceInfoJson.links.next;
    while (nextLink !== null) {
      const nextTokenBalanceInfo = await fetch(`${this.url}${nextLink}`, { method: "GET" });
      const nextTokenBalanceInfoJson = await nextTokenBalanceInfo.json();
      tokenBalances.push(...nextTokenBalanceInfoJson.tokens);
      nextLink = nextTokenBalanceInfoJson.links.next;
    }

    return tokenBalances;
  }

    async getAccountInfo(accountId: AccountId) {
      const accountInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}`, { method: "GET" });
      const accountInfoJson = await accountInfo.json();
      return accountInfoJson;
    }
  }

  ```
</Accordion>

#### 2.2 Query Token Information by Token ID

In the previous step we wrote code to obtain the current token balance of an account. Next we will retieve the type of token (Non-Fungible or Fungible), decimal precision, token name and symbol.

Open `src/services/wallets/mirrorNodeClient.ts` and paste the interface outside of and above the `MirrorNodeClient` class.

```typescript  theme={null}
export interface MirrorNodeTokenInfo {
  type: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE',
  decimals: string,
  name: string,
  symbol: string
  token_id: string,
}
```

Paste the below HTTP GET request outside of and below the `getAccountTokenBalances` function in the `src/services/wallets/mirrorNodeClient.ts` file.

```typescript  theme={null}
// Purpose: get token info for a token
// Returns: a MirrorNodeTokenInfo 
async getTokenInfo(tokenId: string) {
  const tokenInfo = await fetch(`${this.url}/api/v1/tokens/${tokenId}`, { method: "GET" });
  const tokenInfoJson = await tokenInfo.json() as MirrorNodeTokenInfo;
  return tokenInfoJson;
}
```

#### 2.3 Query Account NFT Information by AccountID

In the previous step we wrote code to obtain the token details (token type, decimals, name, and symbol). Next we will retrieve the NFT serial numbers that are owned.

Open `src/services/wallets/mirrorNodeClient.ts` and paste the interface outside of and above the `MirrorNodeClient` class.

```typescript  theme={null}
export interface MirrorNodeNftInfo {
  token_id: string,
  serial_number: number,
}
```

Paste the below HTTP GET request outside of and below the `getTokenInfo` function in the `src/services/wallets/mirrorNodeClient.ts` file.

```typescript  theme={null}
// Purpose: get NFT Infor for an account
// Returns: an array of NFTInfo
async getNftInfo(accountId: AccountId) {
  const nftInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}/nfts?limit=100`, { method: "GET" });
  const nftInfoJson = await nftInfo.json();

  const nftInfos = [...nftInfoJson.nfts] as MirrorNodeNftInfo[];

  // because the mirror node API paginates results, we need to check if there are more results
  // if links.next is not null, then there are more results and we need to fetch them until links.next is null
  let nextLink = nftInfoJson.links.next;
  while (nextLink !== null) {
    const nextNftInfo = await fetch(`${this.url}${nextLink}`, { method: "GET" });
    const nextNftInfoJson = await nextNftInfo.json();
    nftInfos.push(...nextNftInfoJson.nfts);
    nextLink = nextNftInfoJson.links.next;
  }
  return nftInfos;
}
```

#### 2.4 Combine Account Token Balances and Token Information via Data Aggregation

We need to combine all of our HTTP response data in order to display our available tokens in our DApp.

Open `src/services/wallets/mirrorNodeClient.ts` and paste the interface outside of and above the `MirrorNodeClient` class.

```typescript  theme={null}
export interface MirrorNodeAccountTokenBalanceWithInfo extends MirrorNodeAccountTokenBalance {
  info: MirrorNodeTokenInfo,
  nftSerialNumbers?: number[],
}
```

Paste the function outside of and below the `getNftInfo` function in the `src/services/wallets/mirrorNodeClient.ts` file.

```typescript  theme={null}
// Purpose: get token balances for an account with token info in order to display token balance, token type, decimals, etc.
// Returns: an array of MirrorNodeAccountTokenBalanceWithInfo
async getAccountTokenBalancesWithTokenInfo(accountId: AccountId): Promise<MirrorNodeAccountTokenBalanceWithInfo[]> {
  //1.  Retrieve all token balances in the account
  const tokens = await this.getAccountTokenBalances(accountId);
  //2. Create a map of token IDs to token info and fetch token info for each token
  const tokenInfos = new Map<string, MirrorNodeTokenInfo>();
  for (const token of tokens) {
    const tokenInfo = await this.getTokenInfo(token.token_id);
    tokenInfos.set(tokenInfo.token_id, tokenInfo);
  }

  //3. Fetch all NFT info in account
  const nftInfos = await this.getNftInfo(accountId);

  //4. Create a map of token Ids to arrays of serial numbers
  const tokenIdToSerialNumbers = new Map<string, number[]>();
  for (const nftInfo of nftInfos) {
    const tokenId = nftInfo.token_id;
    const serialNumber = nftInfo.serial_number;

    // if we haven't seen this token_id before, create a new array with the serial number
    if (!tokenIdToSerialNumbers.has(tokenId)) {
      tokenIdToSerialNumbers.set(tokenId, [serialNumber]);
    } else {
      // if we have seen this token_id before, add the serial number to the array
      tokenIdToSerialNumbers.get(tokenId)!.push(serialNumber);
    }
  }

  //5. Combine token balances, token info, and NFT info and return
  return tokens.map(token => {
    return {
      ...token,
      info: tokenInfos.get(token.token_id)!,
      nftSerialNumbers: tokenIdToSerialNumbers.get(token.token_id)
    }
  });
}
```

<Info>
  The `getAccountTokenBalancesWithTokenInfo` combines token balances, token info and, NFT info in order to display our available tokens in our DApp.
</Info>

<Accordion title="Complete `mirrorNodeClient.ts` file Checkpoint">
  To ensure you're on the right track, your \`src/services/wallets/mirrorNodeClient.ts\` file should look like below.

  ```typescript  theme={null}
  import { AccountId } from "@hashgraph/sdk";
  import { NetworkConfig } from "../../config";

  export interface MirrorNodeAccountTokenBalance {
    balance: number,
    token_id: string,
  }

  export interface MirrorNodeTokenInfo {
    type: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE',
    decimals: string,
    name: string,
    symbol: string
    token_id: string,
  }

  export interface MirrorNodeNftInfo {
    token_id: string,
    serial_number: number,
  }

  export interface MirrorNodeAccountTokenBalanceWithInfo extends MirrorNodeAccountTokenBalance {
    info: MirrorNodeTokenInfo,
    nftSerialNumbers?: number[],
  }

  export class MirrorNodeClient {
    url: string;
    constructor(networkConfig: NetworkConfig) {
      this.url = networkConfig.mirrorNodeUrl;
    }



    // Purpose: get token balances for an account
    // Returns: an array of MirrorNodeAccountTokenBalance
    async getAccountTokenBalances(accountId: AccountId) {
      // get token balances
      const tokenBalanceInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}/tokens?limit=100`, { method: "GET" });
      const tokenBalanceInfoJson = await tokenBalanceInfo.json();

      const tokenBalances = [...tokenBalanceInfoJson.tokens] as MirrorNodeAccountTokenBalance[];

      // because the mirror node API paginates results, we need to check if there are more results
      // if links.next is not null, then there are more results and we need to fetch them until links.next is null
      let nextLink = tokenBalanceInfoJson.links.next;
      while (nextLink !== null) {
        const nextTokenBalanceInfo = await fetch(`${this.url}${nextLink}`, { method: "GET" });
        const nextTokenBalanceInfoJson = await nextTokenBalanceInfo.json();
        tokenBalances.push(...nextTokenBalanceInfoJson.tokens);
        nextLink = nextTokenBalanceInfoJson.links.next;
      }

      return tokenBalances;
    }

    // Purpose: get token info for a token
    // Returns: a MirrorNodeTokenInfo 
    async getTokenInfo(tokenId: string) {
      const tokenInfo = await fetch(`${this.url}/api/v1/tokens/${tokenId}`, { method: "GET" });
      const tokenInfoJson = await tokenInfo.json() as MirrorNodeTokenInfo;
      return tokenInfoJson;
    }

    // Purpose: get NFT Infor for an account
    // Returns: an array of NFTInfo
    async getNftInfo(accountId: AccountId) {
      const nftInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}/nfts?limit=100`, { method: "GET" });
      const nftInfoJson = await nftInfo.json();

      const nftInfos = [...nftInfoJson.nfts] as MirrorNodeNftInfo[];

      // because the mirror node API paginates results, we need to check if there are more results
      // if links.next is not null, then there are more results and we need to fetch them until links.next is null
      let nextLink = nftInfoJson.links.next;
      while (nextLink !== null) {
        const nextNftInfo = await fetch(`${this.url}${nextLink}`, { method: "GET" });
        const nextNftInfoJson = await nextNftInfo.json();
        nftInfos.push(...nextNftInfoJson.nfts);
        nextLink = nextNftInfoJson.links.next;
      }
      return nftInfos;
    }

    // Purpose: get token balances for an account with token info in order to display token balance, token type, decimals, etc.
    // Returns: an array of MirrorNodeAccountTokenBalanceWithInfo
    async getAccountTokenBalancesWithTokenInfo(accountId: AccountId): Promise<MirrorNodeAccountTokenBalanceWithInfo[]> {
      //1.  Retrieve all token balances in the account
      const tokens = await this.getAccountTokenBalances(accountId);
      //2. Create a map of token IDs to token info and fetch token info for each token
      const tokenInfos = new Map<string, MirrorNodeTokenInfo>();
      for (const token of tokens) {
        const tokenInfo = await this.getTokenInfo(token.token_id);
        tokenInfos.set(tokenInfo.token_id, tokenInfo);
      }

      //3. Fetch all NFT info in account
      const nftInfos = await this.getNftInfo(accountId);

      //4. Create a map of token Ids to arrays of serial numbers
      const tokenIdToSerialNumbers = new Map<string, number[]>();
      for (const nftInfo of nftInfos) {
        const tokenId = nftInfo.token_id;
        const serialNumber = nftInfo.serial_number;

        // if we haven't seen this token_id before, create a new array with the serial number
        if (!tokenIdToSerialNumbers.has(tokenId)) {
          tokenIdToSerialNumbers.set(tokenId, [serialNumber]);
        } else {
          // if we have seen this token_id before, add the serial number to the array
          tokenIdToSerialNumbers.get(tokenId)!.push(serialNumber);
        }
      }

      //5. Combine token balances, token info, and NFT info and return
      return tokens.map(token => {
        return {
          ...token,
          info: tokenInfos.get(token.token_id)!,
          nftSerialNumbers: tokenIdToSerialNumbers.get(token.token_id)
        }
      });
    }

    async getAccountInfo(accountId: AccountId) {
      const accountInfo = await fetch(`${this.url}/api/v1/accounts/${accountId}`, { method: "GET" });
      const accountInfoJson = await accountInfo.json();
      return accountInfoJson;
    }

  }
  ```
</Accordion>

#### 2.5 Add Token Association Support

Before a user can receive a new token, they must associate with it. This association helps protect users from receiving unwanted tokens.

Open `src/services/wallets/mirrorNodeClient.ts` and paste the function below the `getAccountTokenBalancesWithTokenInfo` function.

```typescript  theme={null}
// Purpose: check if an account is associated with a token
// Returns: true if the account is associated with the token, false otherwise
async isAssociated(accountId: AccountId, tokenId: string) {
  const accountTokenBalance = await this.getAccountTokenBalances(accountId);
  return accountTokenBalance.some(token => token.token_id === tokenId);
}
```

### 3. Adding in the User Interface

In this step, we'll copy and paste the home.tsx file, which contains all the necessary code for adding UI components that enable token transfers and association with a token.

Open `src/pages/Home.tsx` and replace the existing code by pasting the below code:

<Accordion title="`Home.tx` file">
  ```typescript  theme={null}
  import { Button, MenuItem, TextField, Typography } from "@mui/material";
  import { Stack } from "@mui/system";
  import { useWalletInterface } from "../services/wallets/useWalletInterface";
  import SendIcon from '@mui/icons-material/Send';
  import { useEffect, useState } from "react";
  import { AccountId, TokenId } from "@hashgraph/sdk";
  import { MirrorNodeAccountTokenBalanceWithInfo, MirrorNodeClient } from "../services/wallets/mirrorNodeClient";
  import { appConfig } from "../config";

  const UNSELECTED_SERIAL_NUMBER = -1;

  export default function Home() {
    const { walletInterface, accountId } = useWalletInterface();
    const [toAccountId, setToAccountId] = useState("");
    const [amount, setAmount] = useState<number>(0);
    // include all of this necessary for dropdown
    const [availableTokens, setAvailableTokens] = useState<MirrorNodeAccountTokenBalanceWithInfo[]>([]);
    const [selectedTokenId, setSelectedTokenId] = useState<string>('');
    const [serialNumber, setSerialNumber] = useState<number>(UNSELECTED_SERIAL_NUMBER);

    const [tokenIdToAssociate, setTokenIdToAssociate] = useState("");

    // include all of this necessary for dropdown
    // Purpose: Get the account token balances with token info for the current account and set them to state
    useEffect(() => {
      if (accountId === null) {
        return;
      }
      const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
      // Get token balance with token info for the current account
      mirrorNodeClient.getAccountTokenBalancesWithTokenInfo(AccountId.fromString(accountId)).then((tokens) => {
        // set to state
        setAvailableTokens(tokens);
        console.log(tokens);
      }).catch((error) => {
        console.error(error);
      });
    }, [accountId])

    // include all of this necessary for dropdown
    // Filter out tokens with a balance of 0
    const tokensWithNonZeroBalance = availableTokens.filter((token) => token.balance > 0);
    // include all of this necessary for dropdown
    // Get the selected token balance with info
    const selectedTokenBalanceWithInfo = availableTokens.find((token) => token.token_id === selectedTokenId);

    // include all of this necessary for dropdown
    // reset amount and serial number when token id changes
    useEffect(() => {
      setAmount(0);
      setSerialNumber(UNSELECTED_SERIAL_NUMBER);
    }, [selectedTokenId]);

    return (
      <Stack alignItems="center" spacing={4}>
        <Typography
          variant="h4"
          color="white"
        >
          Let's buidl a dApp on Hedera
        </Typography>
        {walletInterface !== null && (
          <>
            <Stack
              direction='row'
              gap={2}
              alignItems='center'
            >
              <Typography>
                Transfer
              </Typography>
              <TextField
                label='Available Tokens'
                value={selectedTokenId}
                select
                onChange={(e) => setSelectedTokenId(e.target.value)}
                sx={{
                  width: '250px',
                  height: '50px',
                }}
              >
                <MenuItem
                  value={''}
                >
                  Select a token
                </MenuItem>
                {tokensWithNonZeroBalance.map((token) => {
                  const tokenBalanceAdjustedForDecimals = token.balance / Math.pow(10, Number.parseInt(token.info.decimals));
                  return (
                    <MenuItem
                      key={token.token_id}
                      value={token.token_id}
                    >
                      {token.info.name}({token.token_id}): ({tokenBalanceAdjustedForDecimals})
                    </MenuItem>
                  );
                }
                )}
              </TextField>
              {selectedTokenBalanceWithInfo?.info?.type === "NON_FUNGIBLE_UNIQUE" && (
                <TextField
                  label='Serial Number'
                  select
                  value={serialNumber.toString()}
                  onChange={(e) => setSerialNumber(Number.parseInt(e.target.value))}
                  sx={{
                    width: '190px',
                    height: '50px',
                  }}
                >
                  <MenuItem
                    value={UNSELECTED_SERIAL_NUMBER}
                  >
                    Select a Serial Number
                  </MenuItem>
                  {selectedTokenBalanceWithInfo.nftSerialNumbers?.map((serialNumber) => {
                    return (
                      <MenuItem
                        key={serialNumber}
                        value={serialNumber}
                      >
                        {serialNumber}
                      </MenuItem>
                    );
                  }
                  )}
                </TextField>
              )}
              {selectedTokenBalanceWithInfo?.info?.type === "FUNGIBLE_COMMON" && (
                <TextField
                  type='number'
                  label='amount'
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  sx={{
                    maxWidth: '100px'
                  }}
                />
              )}
              {/* not included in the dropdown stage. this is in the association/send stage */}
              <Typography>
                HTS Token
                to
              </Typography>
              <TextField
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                label='account id or evm address'
              />
              <Button
                variant='contained'
                onClick={async () => {
                  if (selectedTokenBalanceWithInfo === undefined) {
                    console.log(`Token Id is empty.`)
                    return;
                  }
                  
                  // check if receiver has associated
                  const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
                  const isAssociated = await mirrorNodeClient.isAssociated(AccountId.fromString(toAccountId), selectedTokenId);
                  if (!isAssociated) {
                    console.log(`Receiver is not associated with token id: ${selectedTokenId}`);
                    return;
                  }
                  if (selectedTokenBalanceWithInfo.info.type === "NON_FUNGIBLE_UNIQUE") {
                    await walletInterface.transferNonFungibleToken(
                      AccountId.fromString(toAccountId),
                      TokenId.fromString(selectedTokenId),
                      serialNumber);
                  } else {
                    const amountWithDecimals = amount * Math.pow(10, Number.parseInt(selectedTokenBalanceWithInfo.info.decimals));
                    await walletInterface.transferFungibleToken(
                      AccountId.fromString(toAccountId),
                      TokenId.fromString(selectedTokenId),
                      amountWithDecimals);
                  }
                }}
              >
                <SendIcon />
              </Button>
            </Stack>
            <Stack
              direction='row'
              gap={2}
              alignItems='center'
            >
              <TextField
                value={tokenIdToAssociate}
                label='token id'
                onChange={(e) => setTokenIdToAssociate(e.target.value)}
              />
              <Button
                variant='contained'
                onClick={async () => {
                  if (tokenIdToAssociate === "") {
                    console.log(`Token Id is empty.`)
                    return;
                  }
                  await walletInterface.associateToken(TokenId.fromString(tokenIdToAssociate));
                }}
              >
                Associate Token
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    )
  }
  ```
</Accordion>

<Info>
  The crucial part of the code is found within the following code:

  ```typescript  theme={null}
  // include all of this necessary for dropdown
    // Purpose: Get the account token balances with token info for the current account and set them to state
    useEffect(() => {
      if (accountId === null) {
        return;
      }
      const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
      // Get token balance with token info for the current account
      mirrorNodeClient.getAccountTokenBalancesWithTokenInfo(AccountId.fromString(accountId)).then((tokens) => {
        // set to state
        setAvailableTokens(tokens);
        console.log(tokens);
      }).catch((error) => {
        console.error(error);
      });
    }, [accountId])

  ```

  This code fetches and updates the list of tokens a user owns providing the available tokens to the dropdown menu.
</Info>

### 4. Testing DApp Functionality

The application is ready to be started and tested. You will be testing:

* [ ] Connect to a DApp with a Hedera native wallet through WalletConnect
* [ ] Associate a token
* [ ] Transfer a token to a receiver account

#### 4.1 Test Setup

You'll be creating four Hedera Testnet accounts, each with a balance of 10 HBAR. Two of these accounts will come pre-loaded with their own fungible tokens, and four accounts will come pre-loaded with their own non-fungible tokens (NFTs).

Open a new terminal window and create a new directory and change into that directory

```shell  theme={null}
mkdir hedera-test-accounts && cd hedera-test-accounts
```

Open `hedera-test-accounts` folder in a new visual studio code window.

Create a new file and name it `.env` with the following contents. Remember to enter your account ID and your private key.

```shell  theme={null}
OPERATOR_ID=<enter your account id>
OPERATOR_KEY=<enter your DER private key>
```

Within the `hedera-test-accounts` home directory, execute the following command in the terminal,

```shell  theme={null}
npx github:/hedera-dev/hedera-create-account-and-token-helper
```

<Danger>
  Keep this terminal open for the remainder of the tutorial, as you will refer back to it.
</Danger>

<Accordion title="Test Accounts Sample Output">
  ```json  theme={null}
  {
    "ed25519": {
      "sender": {
        "accountId": "0.0.xxxxxxxx",
        "privateKey": "302...",
        "FungibleTokenId": "0.0.xxxxxxxx",
        "NftTokenId": "0.0.xxxxxxxx"
      },
      "receiver": {
        "accountId": "0.0.xxxxxxxx",
        "privateKey": "302..."
      }
    },
    "ecdsaWithAlias": {
      "sender": {
        "accountId": "0.0.xxxxxxxx",
        "privateKey": "...hexadecimal string of length 64...",
        "FungibleTokenId": "0.0.xxxxxxxx",
        "NftTokenId": "0.0.xxxxxxxx"
      },
      "receiver": {
        "accountId": "0.0.xxxxxxxx",
        "privateKey": "...hexadecimal string of length 64..."
      }
    }
  }
  ```
</Accordion>

#### 4.2 Import Sender and Receiver accounts

Import the sender and receiver accounts that were just outputted into your preferred wallet application. ([MetaMask](https://metamask.io/download/), [HashPack](https://www.hashpack.app/get-started), [Blade](https://helpcenter.bladewallet.io/en/articles/6672314-how-to-install-blade-wallet-google-chrome-extension), or [Kabila](https://www.kabila.app/wallet))

For assistance on how to import a Hedera account into MetaMask refer to our documentation [here](/hedera/tutorials/smart-contracts#import-heder#import-hedera-account-into-metamask).

<Danger>
  Rename your imported accounts within your preferred wallet to keep track which is the sender and receiver account.
</Danger>

#### 4.3 Start the DApp

Navigate back to your application in Visual Studio Code, and in the terminal, run the following command

```shell  theme={null}
npm run start
```

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=18ce72b15822e44cd718c4cac6771463" data-og-width="3000" width="3000" data-og-height="516" height="516" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=c9f5bf06fbc6d3f101c5bbcf78411411 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=2305820bb0d1a6a2c0bd582bffde6f15 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7240c580b08ed9f4e72b8055302d3d25 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=3deb3dc70a14ddfe3b08d5a3b21afd73 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=14b972c0db914b75e797c7380298ef4f 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-4.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7e0dc8c7241b84fd9271ea5fd454082f 2500w" />
</Frame>

#### 4.4 Connect to DApp as the Receiver

Click the `Connect Wallet` button in the upper right and select MetaMask and select the Sender account.

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=45eee63c7ae3cfe8cb95fa3612ad0693" data-og-width="1382" width="1382" data-og-height="739" height="739" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=20617efe636efbb64f5fd68ff0cbd482 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=d75d1d4141a1a5a0eebf554fb69955ed 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=c59a7ec5b54c309daafa9f75be2e750a 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=2d64584566b856e5a5903220467546f4 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=f541ad532f63b79ad8564c3fd63dbfc2 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-5.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=32109e2c2dc8b3c6a020f40f59779d9e 2500w" />
</Frame>

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=4495acfcbd36121eae49e98ec02457cb" data-og-width="356" width="356" data-og-height="615" height="615" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=40f29158d6c9211a7777c0af023b1d3c 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=cec7abfc01c3be1ffd746b83d0e28f73 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=427ec83715437c30ac410cb3aad82e06 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7702980489f6b08defcaf3cb1a09ef2c 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=609d56a5bd955a397e8298b1a9533e23 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-6.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=89fc40354fb4a3694d4ec43c07f58813 2500w" />
</Frame>

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=ac6c93f984a31f4e7c5cad7b3a977b74" data-og-width="1374" width="1374" data-og-height="733" height="733" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=13a412f031493177f9840506c03e765a 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=ebbd51d7478d6d48c3aeba3603ecb020 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e6a7af47db45bc737734353b1ae6fe9e 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=fb499c9506b2dd001f083ee0c2700bf3 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=2a91336d6b1ef198689ffc15f8956e10 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-7.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=d551717287e4982c1a9f699e2efa57e2 2500w" />
</Frame>

<Accordion title="WalletConnect Instructions">
  Open HashPack and unlock your wallet

  Go back to the DApp homepage and click 'Connect Wallet'

  Choose WalletConnect

  Copy the connection string

  <Frame>
    <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=41425a8bc8faf8f9fcde5f2657226b61" data-og-width="598" width="598" data-og-height="803" height="803" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=3c4d430a60f13df89decc8ed74af0231 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=468d1d010cefd07097e07023fca5ee11 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=07912fb14021b8dc3b786ca1085de20f 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=d3bbafa80c68d1e2c5c48b00f7561e72 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=42695421fc4baff990887c910de37cf6 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-8.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e918242f29d0ded6aae690812909acc4 2500w" />
  </Frame>

  Open HashPack and connect to DApp by clicking on the world in the upper right

  <Frame>
    <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0dfe6a506e5f253703cace0973943efd" data-og-width="586" width="586" data-og-height="834" height="834" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=04d3487ca5092fa02efc13ca8100a8d0 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=a718b18752b0c3aab1f4b6376cf5e7e2 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=58338807649e527856311d56e09ca04f 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=3e04929c748190d84811bdd5154db42e 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7b2a64742db64904768b17f71c6fbff9 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-9.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e04ad20b55d49d2a8ce8639fb8f1ffaf 2500w" />
  </Frame>

  Paste the walletconnect string into HashPack pairing string textbox

  <Frame>
    <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=29b27ee36c5b45c7d0f5a2641533d258" data-og-width="527" width="527" data-og-height="327" height="327" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=420a428b627ae517baad3e8f2cc70e0e 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b75ad9bc581351d048212dadea39ee13 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=361b832253e6aa98b0bcc7eeadc27b8d 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=86fd286c938725e374abd5809cd260be 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0fc2638e55cdb9452998776581b0de6e 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-10.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=ad1fa8790e931fbf58593e0214d9afac 2500w" />
  </Frame>

  Select the Receiver account to connect with the DApp

  <Frame>
    <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0ca909fa1af7a204493c0451b4c2c72f" data-og-width="478" width="478" data-og-height="425" height="425" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e25b90d2ec9f1d3a4c0a7b37d003d2fe 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b6b95032ac112e4403745d56a38c0ee7 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=2044f3b1a44b8bfb3ce3669f71ef95ef 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=cc7a48f35c4c590fe44525b51c8c98fb 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=91cebb062511a2eda100df4de171fd1a 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-11.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=1dbac6f805bdcb554a7b036d93a3ee6a 2500w" />
  </Frame>

  ✅ You're connected!
</Accordion>

#### 4.5 Associate Receiver Account with Sender Account NFT

Open the output of the test accounts you created earlier and copy the `ecdsaWithAlias` Sender's account `NftTokenId`

Paste the `NftTokenId` in the DApps associate token textbox and click the button `Associate`

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=2512e993ba191a9826f0d4c8bfb35df5" data-og-width="646" width="646" data-og-height="138" height="138" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0bcad34e81c0ea480b096a58463e2a10 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=25a736db40664c7f184a8113934b1ec5 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=6c034121401d82f95dc77682ffccf692 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=4e0cdf53e5ad9e06f92fc30af90a7f4b 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=7a09eec7584a29d09a7f55b66458a112 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-12.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=5d7644b7ce9ffe6c5531dbcce87a5b75 2500w" />
</Frame>

MetaMask will prompt you to sign the transaction. If the extension does not automatically open, you will need to manually click on the MetaMask extension.

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=474d7209ad468f3b7268d0163e1b1dc3" data-og-width="350" width="350" data-og-height="612" height="612" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=31c0859fbf7b915066ed73aa6856b8c2 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=8e086b8c3aeecdb44b10e0b45a18316b 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b3e2be95bbcf670d0f15b984a243018e 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=48e78f72b67ceb95746eb17871cf7946 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=c6386831831ee385995631cb971ff1a8 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-13.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=4345f0f65da5b219908b4204a044c959 2500w" />
</Frame>

Confirm the transaction

<Warning>
  The react template uses the Hashio JSON RPC Relay URL to work with MetaMask. If you are experiencing degraded performance, follow this [guide](/hedera/tutorials/more-tutorials/json-rpc-connections) to switch to Arkhia or set up your own JSON RPC Relay. Edit the `src/config/networks.ts` with the new JSON RPC Relay URL.
</Warning>

#### 4.6 Transfer NFT to Receiver Account

Disconnect as the Receiver account and reconnect with the Sender account. To do this, open the MetaMask extension, click on the three dots in the upper right, select "Connected Sites," and then disconnect the Receiver account. All other wallets disconnect by clicking on your account ID in the upper right of the DApp homepage.

Connect to the DApp as the Sender Account.

As the Sender,

* Select from available tokens the HederaNFT
* Select the NFT with serial number 5 from the drop-down menu.
* Enter the account ID or EVM address of the Receiver account.
* Click the "send" button.
* Sign the transaction on MetaMask to complete the transfer of the NFT from the Sender to the receiver account.

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=1abc4e5b60c2ead0fd5b77d0aacb9c7b" data-og-width="1373" width="1373" data-og-height="326" height="326" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=0af106b3251df773020eb436d6b3fb68 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=41736062d9eb0247181055e69c4b01f7 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=48f31e687f5b5e2e5461ae7944c39242 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=e1b422711f5bc5f21f216a1a1a7802c3 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=463727b358450ff648e36b689d2f7192 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-14.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=09564ab25ef54f3d1ba12f2fc62833c4 2500w" />
</Frame>

#### 4.7 Verify Receiver Account Receieved the NFT

Disconnect as the Sender account and reconnect as the Receiver account.

Check the dropdown menu and ensure the Receiver account has NFT serial number 5.

<Frame>
  <img src="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b6f1080a1dd3674fd7490fde985b09db" data-og-width="1184" width="1184" data-og-height="321" height="321" data-path="images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=280&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=56257dec8512a8da4957424fc8c198a2 280w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=560&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=65ec4bfadd770f8e1da712931809094d 560w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=840&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=9cae0689398c881242a108ce1115a13e 840w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=1100&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=af5f9f892bd6ececa9431e9f852a2014 1100w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=1650&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=b422155b45eef08804fbb7c9b4358a68 1650w, https://mintcdn.com/hedera-0c6e0218/uli-GWBEP4c7xh-c/images/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect/develop-a-hedera-dapp-integrated-with-walletconnect-15.png?w=2500&fit=max&auto=format&n=uli-GWBEP4c7xh-c&q=85&s=1e9d956b7f9d0f36436f24fb6bb5e483 2500w" />
</Frame>

### Try with HashPack, Blade or Kabila

Optionally, import your accounts into any of the above Hedera native wallets and test out transferring more tokens.

### Complete

🎉 Congratulations! You have successfully walked through creating a Hedera DApp that transfers HTS tokens using MetaMask, HashPack, Blade, or Kabila.

You have learned how to:

* [x] Query the mirror node for account token balance, token information, and Non-fungible information.
* [x] Query the mirror node to check if the receiver has associated with a token ID
* [x] Associate an HTS token with HashPack, Kabila, Blade, or MetaMask through a UI
* [x] Transfer an HTS token through a UI

***

<Columns cols={2}>
  <Card title="Writer: Abi Castro, DevRel Engineer" arrow>
    [GitHub](https://github.com/a-ridley) | [LinkedIn](https://linkedin.com/in/abixcastro)
  </Card>
</Columns>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.hedera.com/llms.txt