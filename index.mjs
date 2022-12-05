import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ALGO_WalletConnect as WalletConnect } from '@reach-sh/stdlib';
const stdlib = loadStdlib(process.env);
stdlib.setWalletFallback(stdlib.walletFallback({providerEnv: 'TestNet', WalletConnect }));


const bobPassphrase = "unlock garage rack news treat bonus census describe stuff habit harvest imitate cheap lemon cost favorite seven tomato viable same exercise letter dune able add";

(async () => {

  const accAlice = await stdlib.getDefaultAccount();
  const accBob = await stdlib.newAccountFromMnemonic(bobPassphrase); 

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const beforeAlice = await getBalance(accAlice);
  const beforeBob = await getBalance(accBob);

  const ctcAlice = accAlice.contract(backend);
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

  const FINGERS = [0, 1, 2, 3, 4, 5];
  const GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

  const Player = (Who) => ({
    ...stdlib.hasRandom,
    getFingers: async () => {
      const fingers = Math.floor(Math.random() * 6);         
      console.log(`${Who} shoots ${FINGERS[fingers]} fingers`);     
      return fingers;
    },
    getGuess:  async (fingers) => {
     
      const guess= Math.floor(Math.random() * 6) + FINGERS[fingers];
    
      if ( Math.random() <= 0.01 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  ${Who} takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }
      }
      console.log(`${Who} guessed total of ${guess}`);   
      return guess;
    },
    seeWinning: (winningNumber) => {    
      console.log(`Actual total fingers thrown: ${winningNumber}`);
      console.log(`----------------------------`);  
    },

    seeOutcome: (outcome) => {
      console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
      console.log(`${Who} observed a timeout`);
    },
  });

  await Promise.all([
    backend.Alice(ctcAlice, {
      ...Player('Alice'),
      wager: stdlib.parseCurrency(2),    
      ...stdlib.hasConsoleLogger,
    }),
    backend.Bob(ctcBob, {
      ...Player('Bob'),
      acceptWager: (amt) => {      
        console.log(`Bob accepts the wager of ${fmt(amt)}.`);
      },
      ...stdlib.hasConsoleLogger,      
    }),
  ]);
  const afterAlice = await getBalance(accAlice);
  const afterBob = await getBalance(accBob);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);


})();