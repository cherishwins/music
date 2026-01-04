// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TigerPayments - Self-Sovereign Payment Receiver
 *
 * YOU control this. No middlemen. No service providers.
 *
 * Flow:
 * 1. User approves USDC spending
 * 2. User calls pay() with invoice ID
 * 3. Contract transfers USDC to treasury
 * 4. Event emitted for backend to verify
 * 5. Backend delivers content
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract TigerPayments {
    // Treasury address - where all payments go
    address public treasury;

    // Owner - can update treasury
    address public owner;

    // USDC token address
    IERC20 public usdc;

    // Payment records
    struct Payment {
        address payer;
        uint256 amount;
        uint256 timestamp;
        bool fulfilled;
    }

    // invoiceId => Payment
    mapping(bytes32 => Payment) public payments;

    // Events for backend to listen to
    event PaymentReceived(
        bytes32 indexed invoiceId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentFulfilled(bytes32 indexed invoiceId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc, address _treasury) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        owner = msg.sender;
    }

    /**
     * Pay for an invoice
     * @param invoiceId Unique identifier for this payment (hash of order details)
     * @param amount Amount in USDC (6 decimals)
     */
    function pay(bytes32 invoiceId, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(payments[invoiceId].payer == address(0), "Invoice already paid");

        // Transfer USDC from payer to treasury
        bool success = usdc.transferFrom(msg.sender, treasury, amount);
        require(success, "USDC transfer failed");

        // Record payment
        payments[invoiceId] = Payment({
            payer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            fulfilled: false
        });

        emit PaymentReceived(invoiceId, msg.sender, amount, block.timestamp);
    }

    /**
     * Mark invoice as fulfilled (content delivered)
     * Only owner can call this
     */
    function markFulfilled(bytes32 invoiceId) external onlyOwner {
        require(payments[invoiceId].payer != address(0), "Invoice not found");
        require(!payments[invoiceId].fulfilled, "Already fulfilled");

        payments[invoiceId].fulfilled = true;
        emit PaymentFulfilled(invoiceId);
    }

    /**
     * Check if an invoice is paid
     */
    function isPaid(bytes32 invoiceId) external view returns (bool) {
        return payments[invoiceId].payer != address(0);
    }

    /**
     * Get payment details
     */
    function getPayment(bytes32 invoiceId) external view returns (
        address payer,
        uint256 amount,
        uint256 timestamp,
        bool fulfilled
    ) {
        Payment memory p = payments[invoiceId];
        return (p.payer, p.amount, p.timestamp, p.fulfilled);
    }

    /**
     * Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
