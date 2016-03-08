SzaboDice
=============

SzaboDice is a dice game that allow users to wager Ether or invest in the house bankroll. SzaboDice has no owner. It is a decentralized autonomous organization governed by the Ethereum blockchain. The main SzaboDice page can be found at [http://szabodice.github.io](http://szabodice.github.io). This repository is meant to house the smart contract code and utilities for interacting with the smart contract. The smart contract has been deployed with different odds and payout parameters to a number of contract addresses such that SzaboDice is actually a collection of smart contracts that users can interact with for different betting experiences.

Smart contract
-------

The contract source code, [dice.sol](dice.sol), is written in Solidity, Ethereum's language for constructing smart contracts. [contract.js](contract.js) makes it easy to interact with the smart contract by betting, investing, and divesting. Before running contract.js, make sure the necessary node modules are installed using `npm init`. Try running `node contract.js --help` to get a sense of the possible arguments.

The following command will show all the details of the specified SzaboDice address. (You can look up SzaboDice addresses on [http://szabodice.github.io](http://szabodice.github.io)).

```
node contract.js --contract_dice_addr '0xSZABODICE_ADDRESS_HERE'
```

To invest 100 eth from 0xYOUR_ADDRESS, run the following command. If you leave out the armed parameter, the transaction will not actually be sent.
```
node contract.js --contract_dice_addr '0xSZABODICE_ADDRESS_HERE' --eth_addr '0xYOUR_ADDRESS' --invest 100 --armed
```

To divest 100 eth, run the following command.
```
node contract.js --contract_dice_addr '0xSZABODICE_ADDRESS_HERE' --eth_addr '0xYOUR_ADDRESS' --divest 100 --armed
```

To wager 1 eth, run the following command.
```
node contract.js --contract_dice_addr '0xe937ee393003e06d601d1e60d9dc16b734bee532' --eth_addr '0xYOUR_ADDRESS' --bet 1 --armed
```

You can also bet by sending directly to the contract address. You can do this, for example, by running the following command in Geth.
```
eth.sendTransaction({from: '0xYOUR_ADDRESS', to: '0xSZABODICE_ADDRESS_HERE', value: web3.toWei(1, "ether"), gas: 122000})
```

Smart contract structure
-------

It has the following structures, variables, and functions:

* **uint public pwin**: probability of winning (out of 10000, so 10000 = 100%)
* **uint public edge**: edge percentage (out of 10000, so 10000 = 100%)
* **uint public maxWin**: max profit (before edge is taken) as percentage of bankroll (out of 10000, so 10000 = 100%)
* **uint public minBet**: minimum bet size
* **uint public maxInvestors**: maximum number of investors
* **struct Investor {address user; uint capital}**: a structure to hold an investor
* **mapping(uint => Investor) investors**: a mapping of investor IDs to investors (investor ID starts at 1)
* **uint public numInvestors**: the current number of investors
* **mapping(address => uint) investorIDs**: a mapping of addresses to investor IDs
* **uint public invested**: the amount invested (note that this does not include the profit, see the getBankroll function)
* **struct Bet {address user; uint bet;}**: a structure to hold a bet
* **mapping (bytes32 => Bet) bets**: a mapping of Oraclize ids to bets
* **uint public numBets**: the number of bets that have been resolved
* **uint public amountWagered**: the amount that has been wagered and resolved
* **int public profit**: the current amount of untaken profit
* **int public takenProfit**: the current amount of taken profit
* **function Dice(uint pwinInitial, uint edgeInitial, uint maxWinInitial, uint minBetInitial, uint maxInvestorsInitial)**: This is the constructor. Besides setting state variables, it also calls Oraclize once. After deploying the contract, it's a good idea to look for the response from Oraclize to make sure it's working properly.
* **function()**: This is the default function. All it does is call the bet() function.
* **function bet()**: This is the function gamblers can use to place bets. The value sent is the amount wagered. It uses approximately ~110,000 gas. If the value is less than the min bet or more than the max bet, an error is thrown and the value is returned. This function will call Oraclize requesting a random number from 0 to 9999 from Random.org and store a mapping between the Oraclize ID for the request and a new bet object. This function will also subtract the Oraclize fee from the profit state variable (the house pays the Oraclize fees, so make sure the min bet is high enough that the edge covers the Oraclize fees).
* **function __callback(bytes32 id, string result)**: This is the function Oraclize calls to return a random number. This function will resolve the bet, update numBets, amountWagered, and profit, and send the user either the payout or 1 Wei (as an indication that the bet was a loser). Note, this function does a final check to make sure the bet is less than twice the max bet (to allow for the bankroll to change somewhat between the time the bet is made and the time the bet is resolved). If the bet is too large, it will be returned to the user (and the house will eat the loss on the Oraclize fee).
* **function invest()**: This is the function an investor can call to invest in the house. If the number of investors is already at the maximum, this investment will only be accepted if it can replace the lowest investment because it is greater than the lowest investment. The exception to this rule is that the very first investor cannot be replaced. If the lowest investment is being replaced, it will be returned to the investor. Note that before adjusting the investors mapping, this function will call rebalance().
* **function rebalance() private**: This function rebalances the investments by dividing the profit (or loss) among the current investors proportionally and marking the current profit as taken.
* **function divest(address user, uint amount) private**: This is a private helper function that holds the logic used by divest(). It is also used by invest() to handle a forced divestment when an investor has been outbid.
* **function divest(uint amount)**: This is the function an investor can call to divest a portion (or all) of his invested amount. Note that this function will call rebalance() before processing the divestment.
* **function getBalance(address user) constant returns(uint)**: This returns the current balance of the specified investor (including profit or loss to date).
* **function getBankroll() constant returns(uint)**: This returns the current bankroll of the house (including profit or loss to date).
* **function getMinInvestment() constant returns(uint)**: This returns the current minimum investment required to invest in the house bankroll.
* **function getStatus() constant returns(uint, uint, uint, uint, uint, uint, int, uint)**: This is a helper function that returns getBankroll(), pwin, edge, maxWin, minBet, amountWagered, profit, minimum investment.
