import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import TakToken from './abis/TakToken.json';
import TakTokenICO from './abis/TakTokenICO.json';
import { TakToken_abi, TakToken_address } from './config';
import { TakTokenICO_abi, TakTokenICO_address } from './config';


class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const TakToken = new web3.eth.Contract(TakToken_abi, TakToken_address);
      const TakTokenICO = new web3.eth.Contract(TakTokenICO_abi, TakTokenICO_address);
      this.setState({ TakToken, TakTokenICO });
      const accounts = await web3.eth.getAccounts();

      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], web3: web3 })
      }
      else {
        window.alert('Please login to MetaMask.')
      }

      // load contracts

      try {
        const token = new web3.eth.Contract(TakToken.abi, TakToken.networks[netId].address);
        const tokenSale = new web3.eth.Contract(TakTokenICO.abi, TakTokenICO.networks[netId].address);
        const tokenAddress = TakToken.networks[netId].address;
        const tokenSaleAddress = TakTokenICO.networks[netId].address;
        const tokenPrice = await tokenSale.methods.tokenPrice().call();
        const balance = await token.methods.balanceOf(this.state.account).call();
        const tokens = await tokenSale.methods.tokens().call();


        this.setState({
          token: token,
          tokenSale: tokenSale,
          tokenAddress: tokenAddress,
          tokenSaleAddress: tokenSaleAddress,
          tokenPrice: tokenPrice,
          balance: balance,
          tokens: tokens,
        });

      } catch (e) {
        console.log('Error', e);
        window.alert('Contracts not deployed to the current network.');
      }
    }
    else {
      window.alert('This is a blockchain website. Please install the MetaMask browser extension to continue.')
    }

  }

  async invest(tokens) {
    if (this.state.tokenSale !== 'undefined') {
      try {
        console.log(tokens)
        await this.state.tokenSale.methods.invest(tokens).send({ from: this.state.account, value: tokens * this.state.tokenPrice, gas: 500000 });
        await window.location.reload(false);
      } catch (e) {
        {
          window.alert('An error has occured: make sure you have enough Rinkeby funds, refresh the page, and enter a valid number');
        }
        console.log('Error, buying tokens: ', e);
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      tokenSale: null,
      tokenAddress: null,
      tokenSaleAddress: null,
      balance: 0,
      tokenPrice: 0.001,
      tokens: 0,
      totalSupply: 1000000,
    }
  }


  render() {
    return (
      <div className='body text-monospace'>
        <div className="main container">
          <br />
          <h1 className="text-center">TakToken ICO</h1>
          <br />
          <h6 className="text-center">
            This application is on the Rinkeby test network. Please use an account connected to Rinkeby in order to use this application.
          </h6>
          <br />
          <h6 className="text-center">
            When you purchase TT, your transaction will take a few seconds to be processed on the blockchain.
          </h6>
          <hr /><br />
          <div id="content" className="row">
            <div className="col-lg-12 col-md-12">
              <p className="text-center">Introducing "TakToken" (TT)!
                Token price is {this.state.tokenPrice} Ether.
                You currently have {this.state.balance} TT</p>
              <br />
            </div>
            <form className="col-lg-12 col-md-12"
              role="form"
              onSubmit={(e) => {
                e.preventDefault();
                let tokens = this.tokens.value;
                this.invest(tokens);
              }}>
              <div className="form-grid">
                <div />
                <input
                  type="number"
                  id="numberOfTokens"
                  min="1"
                  pattern="[0-9]"
                  placeholder="amount..."
                  ref={(input) => { this.tokens = input }}></input>
                <span className="input-group-btn left-spacing">
                  <button className="btn btn-primary btn-lg" type="submit">Invest</button>
                </span>
              </div>
            </form>
            <div className="col-lg-12 col-md-12">
              <p className="text-center">{this.state.tokensSold} / {this.state.tokensAvailable} TT tokens sold</p>
              <hr /><br />
              <h6 className="text-center">Account: {this.state.account}</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;






//   render() {
//     return (
//       <div className="container">
//         <h1>Hello, World!</h1>
//         <p>Your account: {this.state.account}</p>
//       </div>
//     );
//   }
// }

// export default App;