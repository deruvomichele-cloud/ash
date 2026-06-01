## 🔄 AshSwap - Scambi USDC ↔ ASH a Prezzo Fisso

Il contratto **AshSwap** permette scambi bidirezionali tra USDC e ASH su Base a un **prezzo fisso configurabile**.

### ✨ Funzionalità

| Funzione | Descrizione |
|----------|-------------|
| `swapUsdcForAsh(usdcAmount)` | Invia USDC → Ricevi ASH |
| `swapAshForUsdc(ashAmount)` | Invia ASH → Ricevi USDC |
| `quoteAshForUsdc(usdcAmount)` | Calcola quanti ASH per X USDC |
| `quoteUsdcForAsh(ashAmount)` | Calcola quanti USDC per X ASH |
| `setRate(ashPerUsdc)` | Admin: Cambia il prezzo (es. 7 = 1 USDC = 7 ASH) |
| `setTreasury(address)` | Admin: Cambia indirizzo treasury |
| `withdrawAsh(to, amount)` | Admin: Preleva ASH invenduto |
| `withdrawUsdc(to, amount)` | Admin: Preleva USDC in eccesso |

### 💰 Prezzo Fisso

Il parametro `ashPerUsdc` definisce il tasso di cambio:

```
ashPerUsdc = 7
↓
1 USDC = 7 ASH
7 ASH = 1 USDC
```

Cambiabile solo dall'admin con `setRate()`.

### 🚀 Deploy su Base Sepolia

```bash
# Compila i contratti
npm run compile

# Configura il wallet
npm run configure:wallet

# Pronto al deploy
npm run ready:base-sepolia

# Deploy
npm run deploy:base-sepolia
```

### 🧪 Test

```bash
# Esegui tutti i test
npm test

# Test specifici
npx hardhat test test/AshSwap.test.js
```

### 📊 Indirizzi Base Sepolia

Dopo il deploy, i dati sono salvati in `deployments/base-sepolia.json`:

```json
{
  "BaseCoin": "0x...",
  "AshSwap": "0x...",
  "USDC": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "Treasury": "0x...",
  "AshPerUsdc": 7
}
```

### 🔐 Sicurezza

- ✅ Usa OpenZeppelin `SafeERC20` per trasferimenti sicuri
- ✅ Controlli di input su tutti i parametri
- ✅ Solo owner può cambiare configurazione
- ✅ Nessun prelievo automatico di commissioni
- ⚠️ Non è un contratto audited - usa su testnet prima di mainnet

### 🎯 Flusso Scambio USDC → ASH

1. User approva USDC al contratto AshSwap
2. User chiama `swapUsdcForAsh(100)` (100 USDC)
3. Contratto trasferisce 100 USDC → Treasury
4. Contratto trasferisce 700 ASH → User
5. Evento `SwappedUsdcForAsh` emesso

### 🎯 Flusso Scambio ASH → USDC

1. User approva ASH al contratto AshSwap
2. User chiama `swapAshForUsdc(700)` (700 ASH)
3. Contratto trasferisce 700 ASH → Contratto
4. Contratto trasferisce 100 USDC → User
5. Evento `SwappedAshForUsdc` emesso

### 💡 Differenza da AshSale

| Feature | AshSale | AshSwap |
|---------|---------|---------|
| USDC → ASH | ✅ | ✅ |
| ASH → USDC | ❌ | ✅ |
| Prezzo | Fisso | Fisso |
| Bidirezionale | No | **Sì** |

### 📝 Environment Variables

```bash
TOKEN_NAME=Ashes
TOKEN_SYMBOL=ASH
INITIAL_SUPPLY=1000000
INITIAL_OWNER=0x...
TREASURY_ADDRESS=0x...
ASH_PER_USDC=7
SALE_ALLOCATION=500000
```

### 🆘 Troubleshooting

**"Not enough ASH in contract"**
- Trasferisci più ASH al contratto AshSwap

**"Not enough USDC in contract"**
- Il contratto non ha abbastanza USDC per il prelievo

**"Insufficient Allowance"**
- Approva il contratto prima dello swap

---

**Contatto**: onionhole@protonmail.com
