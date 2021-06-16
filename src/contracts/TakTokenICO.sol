pragma solidity >=0.5.0 <0.9.0;

import "./TakToken.sol";

contract TakTokenICO is TakToken {
    address public admin;
    address payable public deposit;
    uint256 tokenPrice = 0.001 ether; // 1 ETH = 1000 CRTP, 1 CRPT = 0.001
    uint256 public hardCap = 300 ether;
    uint256 public raisedAmount; // this value will be in wei
    uint256 public saleStart = block.timestamp;
    uint256 public saleEnd = block.timestamp + 604800; //one week

    uint256 public tokenTradeStart = saleEnd + 604800; //transferable in a week after saleEnd
    uint256 public maxInvestment = 5 ether;
    uint256 public minInvestment = 0.1 ether;

    enum State {beforeStart, running, afterEnd, halted} // ICO states
    State public icoState;

    constructor(address payable _deposit) public {
        deposit = _deposit;
        admin = msg.sender;
        icoState = State.beforeStart;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    // emergency stop
    function halt() public onlyAdmin {
        icoState = State.halted;
    }

    function resume() public onlyAdmin {
        icoState = State.running;
    }

    function changeDepositAddress(address payable newDeposit) public onlyAdmin {
        deposit = newDeposit;
    }

    function getCurrentState() public view returns (State) {
        if (icoState == State.halted) {
            return State.halted;
        } else if (block.timestamp < saleStart) {
            return State.beforeStart;
        } else if (block.timestamp >= saleStart && block.timestamp <= saleEnd) {
            return State.running;
        } else {
            return State.afterEnd;
        }
    }

    event Invest(address investor, uint256 value, uint256 tokens);

    // function called when sending eth to the contract
    function invest() public payable returns (bool) {
        icoState = getCurrentState();
        require(icoState == State.running);
        require(msg.value >= minInvestment && msg.value <= maxInvestment);

        raisedAmount += msg.value;
        require(raisedAmount <= hardCap);

        uint256 tokens = msg.value / tokenPrice;

        // adding tokens to the inverstor's balance from the founder's balance
        balances[msg.sender] += tokens;
        balances[founder] -= tokens;
        deposit.transfer(msg.value); // transfering the value sent to the ICO to the deposit address

        emit Invest(msg.sender, msg.value, tokens);

        return true;
    }

    // this function is called automatically when someone sends ETH to the contract's address
    receive() external payable {
        invest();
    }

    // burning unsold tokens
    function burn() public returns (bool) {
        icoState = getCurrentState();
        require(icoState == State.afterEnd);
        balances[founder] = 0;
        return true;
    }

    function transfer(address to, uint256 tokens)
        public
        override
        returns (bool success)
    {
        require(block.timestamp > tokenTradeStart); // the token will be transferable only after tokenTradeStart

        // calling the transfer function of the base contract
        super.transfer(to, tokens); // same as Cryptos.transfer(to, tokens);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokens
    ) public override returns (bool success) {
        require(block.timestamp > tokenTradeStart); // the token will be transferable only after tokenTradeStart

        TakToken.transferFrom(from, to, tokens); // same as super.transferFrom(to, tokens);
        return true;
    }
}
