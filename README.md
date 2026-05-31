# Base ERC-20 Coin

Progetto Hardhat per creare e distribuire una coin ERC-20 su Base.

## Cosa include

- Contratto `BaseCoin` ERC-20 basato su OpenZeppelin.
- Contratto `AshSale` per vendere ASH in cambio di USDC.
- Immagine/logo della coin in `assets/ash-coin.png`.
- Logo 64x64 pronto per explorer/wallet in `assets/ash-coin-64.png`.
- Metadata template in `metadata/ashes-token.json`.
- Supply iniziale fissa, mintata una sola volta nel costruttore.
- Deploy configurato per Base Sepolia e Base mainnet.
- Test base per nome, simbolo, supply e destinatario iniziale.

## Configurazione

1. Copia `.env.example` in `.env`.
2. Imposta `WALLET_PRIVATE_KEY` con la chiave del wallet che firma il deploy.
3. Imposta `TOKEN_NAME`, `TOKEN_SYMBOL`, `INITIAL_SUPPLY` e `INITIAL_OWNER`.
4. Per testnet usa ETH su Base Sepolia; per mainnet usa ETH su Base.

Non condividere mai seed phrase o private key. Usa preferibilmente un wallet nuovo e dedicato al deploy.

## Comandi

```bash
npm run compile
npm test
npm run configure:wallet
npm run ready:base-sepolia
npm run deploy:base-sepolia
npm run deploy:sale:base-sepolia
```

## Deploy Base mainnet

Base mainnet usa chain ID `8453`. Il contratto di vendita usa USDC Circle ufficiale:

```text
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

Usa un wallet nuovo dedicato alla mainnet. Non riutilizzare wallet o chiavi private esposte durante i test.

Configura localmente `.env`:

```text
MAINNET_INITIAL_OWNER=0xYourNewMainnetWallet
MAINNET_TREASURY_ADDRESS=0xYourNewMainnetWallet
MAINNET_DEPLOY_CONFIRMATION=I_UNDERSTAND_THIS_USES_REAL_FUNDS
```

Salva la chiave senza mostrarla nel terminale e controlla la configurazione:

```bash
npm run configure:wallet:mainnet
npm run ready:base-mainnet
```

Il deploy reale va eseguito solo dopo aver controllato supply, treasury, cambio e saldo ETH:

```bash
npm run deploy:sale:base-mainnet
```

## Vendita ASH con USDC

Su Base Sepolia il contratto `AshSale` usa USDC all'indirizzo ufficiale Circle:

```text
0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

La variabile `ASH_PER_USDC=7` imposta il cambio:

```text
1 USDC = 7 ASH
```

Il deploy `deploy:sale:base-sepolia` crea sia `BaseCoin` sia `AshSale`. Se `INITIAL_OWNER` coincide con il wallet che fa deploy, lo script trasferisce automaticamente `SALE_ALLOCATION` ASH al contratto di vendita.

## Immagine della coin

L'immagine locale della coin e':

```text
assets/ash-coin.png
```

La versione 64x64 pronta per BaseScan e':

```text
assets/ash-coin-64.png
```

Per farla apparire su wallet, explorer o listing, carica `assets/ash-coin.png` su IPFS o su un URL pubblico stabile, poi sostituisci `ipfs://REPLACE_WITH_ASH_COIN_IMAGE_CID` in `metadata/ashes-token.json`.

Con Pinata puoi farlo con:

```bash
npm run upload:metadata
```

Prima imposta `PINATA_JWT` nel file `.env`. Lo script carica l'immagine, aggiorna `metadata/ashes-token.json` con il CID reale e carica anche il metadata JSON.

Alternativa GitHub per testnet:

```text
metadata/ashes-token.github.json
```

GitHub non e' IPFS, ma puo' ospitare l'immagine con un URL pubblico `raw.githubusercontent.com`. Dopo aver pubblicato questo progetto su GitHub, sostituisci `REPLACE_OWNER`, `REPLACE_REPO` e `REPLACE_BRANCH` nel file `metadata/ashes-token.github.json`.

## Far apparire il logo nei wallet

Per un ERC-20 il logo non e' letto direttamente dal contratto. Dopo il deploy:

1. Verifica il contratto su BaseScan.
2. Apri la pagina del token su BaseScan.
3. Invia una richiesta "Token Info Update" come creator/team del token.
4. Usa `assets/ash-coin-64.png` come logo e inserisci i link pubblici del progetto.

Molti wallet e app leggono il logo da explorer, token list o database esterni. Quindi il passaggio BaseScan aumenta la compatibilita', ma la visualizzazione puo' dipendere dal singolo wallet e dalla sua cache.

Per verificare il contratto dopo il deploy imposta `ETHERSCAN_API_KEY` con una chiave Etherscan API v2:

```bash
npm run verify:base-sepolia -- <contract_address> "My Base Coin" "MBC" 1000000 0xYourWallet
npm run verify:base-mainnet -- <contract_address> "My Base Coin" "MBC" 1000000 0xYourWallet
```

Base mainnet usa chain ID `8453`; Base Sepolia usa chain ID `84532`.

## Deploy Base Sepolia

ASHES e il contratto di vendita sono stati distribuiti su Base Sepolia. Gli indirizzi e i link explorer sono salvati in:

```text
deployments/base-sepolia.json
```

Logo wallet pubblico:

```text
https://raw.githubusercontent.com/deruvomichele-cloud/ash/main/assets/ash-coin-64.png
```

Nota: l'endpoint `tokenupdate` di BaseScan non e' disponibile su Base Sepolia. Il logo pubblico e' pronto per wallet o token list che supportano asset personalizzati; la richiesta BaseScan Token Info Update va eseguita dopo il deploy su Base mainnet.
