const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');

const generateSeed = async (address) => {
  let seedPhrase;
  let balance;

  while (!balance || balance < 0.1) {
    seedPhrase = bip39.generateMnemonic();
    const rootSeed = bip39.mnemonicToSeed(seedPhrase);
    const masterKey = bitcoin.bip32.fromSeed(rootSeed);
    const childKey = masterKey.derivePath("m/44'/0'/0'/0/0");
    const addressFromChildKey = bitcoin.payments.p2wpkh({
      pubkey: childKey.publicKey,
    }).address;

    balance = await getBalance(addressFromChildKey);

    console.log(
      `Seed phrase: ${seedPhrase}\nAddress: ${addressFromChildKey}\nBalance: ${balance}\n`
    );
  }

  console.log(
    `\n**Найден кошелек с балансом более 0.1 BTC!**\n\nSeed phrase: ${seedPhrase}\nAddress: ${addressFromChildKey}\nBalance: ${balance}\n\n**Скопируйте seed-фразу и хеш-сумму в надежное место!**`
  );
};

const getBalance = async (address) => {
  const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
  const response = await fetch(url);
  const data = await response.json();
  return data.final_balance / 100000000;
};

const addressInput = document.getElementById('address-input');
const generateButton = document.getElementById('generate-button');
const outputElement = document.getElementById('output');

generateButton.addEventListener('click', async () => {
  const address = addressInput.value;
  outputElement.textContent = '';

  console.log(`Введен адрес: ${address}`);
  console.log('Начата генерация seed-фразы...');

  await generateSeed(address);
});
