const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("ethers");

const envPath = path.join(__dirname, "..", ".env");
const compromisedTestnetWallet = "0xA6Bb39f60D5B5856334F6A49039a49070b0706BE";

function replaceEnvValue(content, name, value) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  if (!pattern.test(content)) {
    throw new Error(`${name} non trovato in .env.`);
  }
  return content.replace(pattern, `${name}=${value}`);
}

function main() {
  const entropy = crypto.randomBytes(32);
  const mnemonic = ethers.Mnemonic.fromEntropy(entropy);
  const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic);

  if (wallet.address.toLowerCase() === compromisedTestnetWallet.toLowerCase()) {
    throw new Error("Wallet collision detected. Run the command again.");
  }

  let env = fs.readFileSync(envPath, "utf8");
  env = replaceEnvValue(env, "MAINNET_WALLET_PRIVATE_KEY", wallet.privateKey);
  env = replaceEnvValue(env, "MAINNET_INITIAL_OWNER", wallet.address);
  env = replaceEnvValue(env, "MAINNET_TREASURY_ADDRESS", wallet.address);
  fs.writeFileSync(envPath, env);

  console.log("");
  console.log("NUOVO WALLET MAINNET CREATO");
  console.log(`Indirizzo pubblico: ${wallet.address}`);
  console.log("");
  console.log("TRASCRIVI ORA QUESTE 24 PAROLE SU CARTA.");
  console.log("Non fare screenshot, non inviarle in chat e non salvarle nel cloud.");
  console.log("");
  console.log(mnemonic.phrase);
  console.log("");
  console.log("La private key e' stata configurata localmente in .env.");
  console.log("Dopo aver trascritto le parole, chiudi il terminale.");
}

main();
