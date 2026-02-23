// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SwarmClauseEscrow
 * @notice Autonomous escrow for AI-negotiated contracts on Hedera.
 *         Holds funds until delivery is confirmed, or slashes penalty on breach.
 *
 * Flow:
 *   1. Buyer calls depositEscrow() with the agreed price
 *   2. Both agents accept via acceptTerms()
 *   3. Seller calls confirmDelivery() after fulfillment
 *   4. Arbiter can slashPenalty() on breach
 */
contract SwarmClauseEscrow {
    // ── State ───────────────────────────────────────────────────────────────

    enum Status { CREATED, ESCROW_LOCKED, ACCEPTED, COMPLETED, PENALIZED }

    struct Agreement {
        string  sessionId;
        address buyer;
        address seller;
        uint256 price;
        uint256 deliveryDays;
        uint256 penaltyAmount;
        uint256 escrowBalance;
        uint256 createdAt;
        Status  status;
        bool    buyerAccepted;
        bool    sellerAccepted;
    }

    address public arbiter;          // deployer acts as arbiter
    uint256 public agreementCount;
    mapping(uint256 => Agreement) public agreements;

    // ── Events ──────────────────────────────────────────────────────────────

    event EscrowDeposited(uint256 indexed id, address buyer, uint256 amount);
    event TermsAccepted(uint256 indexed id, address party);
    event DeliveryConfirmed(uint256 indexed id, address seller, uint256 payout);
    event PenaltySlashed(uint256 indexed id, uint256 penalty, uint256 refund);

    // ── Constructor ─────────────────────────────────────────────────────────

    constructor() {
        arbiter = msg.sender;
    }

    // ── Core Functions ──────────────────────────────────────────────────────

    /**
     * @notice Create a new agreement and lock escrow.
     * @param _sessionId   Off-chain session ID from Supabase
     * @param _seller      Seller address
     * @param _deliveryDays Agreed delivery window
     * @param _penaltyAmt  Penalty for breach
     */
    function depositEscrow(
        string calldata _sessionId,
        address _seller,
        uint256 _deliveryDays,
        uint256 _penaltyAmt
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must send escrow amount");
        require(_seller != address(0), "Invalid seller");

        uint256 id = agreementCount++;
        agreements[id] = Agreement({
            sessionId:      _sessionId,
            buyer:          msg.sender,
            seller:         _seller,
            price:          msg.value,
            deliveryDays:   _deliveryDays,
            penaltyAmount:  _penaltyAmt,
            escrowBalance:  msg.value,
            createdAt:      block.timestamp,
            status:         Status.ESCROW_LOCKED,
            buyerAccepted:  false,
            sellerAccepted: false
        });

        emit EscrowDeposited(id, msg.sender, msg.value);
        return id;
    }

    /**
     * @notice Both buyer and seller call this to accept terms.
     */
    function acceptTerms(uint256 _id) external {
        Agreement storage a = agreements[_id];
        require(a.status == Status.ESCROW_LOCKED, "Not in escrow phase");
        require(msg.sender == a.buyer || msg.sender == a.seller, "Not a party");

        if (msg.sender == a.buyer) a.buyerAccepted = true;
        if (msg.sender == a.seller) a.sellerAccepted = true;

        emit TermsAccepted(_id, msg.sender);

        if (a.buyerAccepted && a.sellerAccepted) {
            a.status = Status.ACCEPTED;
        }
    }

    /**
     * @notice Seller confirms delivery → escrow released to seller.
     */
    function confirmDelivery(uint256 _id) external {
        Agreement storage a = agreements[_id];
        require(a.status == Status.ACCEPTED, "Terms not accepted");
        require(msg.sender == a.seller || msg.sender == arbiter, "Not authorized");

        uint256 payout = a.escrowBalance;
        a.escrowBalance = 0;
        a.status = Status.COMPLETED;

        payable(a.seller).transfer(payout);
        emit DeliveryConfirmed(_id, a.seller, payout);
    }

    /**
     * @notice Arbiter slashes penalty on breach. Penalty to arbiter, rest refunded to buyer.
     */
    function slashPenalty(uint256 _id) external {
        require(msg.sender == arbiter, "Only arbiter");
        Agreement storage a = agreements[_id];
        require(
            a.status == Status.ESCROW_LOCKED || a.status == Status.ACCEPTED,
            "Cannot penalize"
        );

        uint256 penalty = a.penaltyAmount;
        if (penalty > a.escrowBalance) penalty = a.escrowBalance;

        uint256 refund = a.escrowBalance - penalty;
        a.escrowBalance = 0;
        a.status = Status.PENALIZED;

        if (penalty > 0) payable(arbiter).transfer(penalty);
        if (refund > 0)  payable(a.buyer).transfer(refund);

        emit PenaltySlashed(_id, penalty, refund);
    }

    // ── View ────────────────────────────────────────────────────────────────

    function getAgreement(uint256 _id) external view returns (Agreement memory) {
        return agreements[_id];
    }
}
