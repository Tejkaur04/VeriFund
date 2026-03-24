// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CrowdFund — Transparent Blockchain Crowdfunding
/// @author You :)
/// @notice People donate to campaigns. Funds only release when donors approve milestones.
///         If the goal isn't met by deadline, everyone gets a full refund automatically.

contract CrowdFund {

    // ================================================================
    //  SECTION 1 — DATA STRUCTURES
    //  Think of these like "templates" for the data we store on-chain
    // ================================================================

    /// @dev One fundraising campaign (e.g. "Help rebuild flood shelter")
    struct Campaign {
        uint256 id;
        address payable creator;   // Person who started the campaign
        string  title;
        string  description;
        uint256 goalAmount;        // How much ETH they want to raise
        uint256 deadline;          // After this time, no more donations
        uint256 totalRaised;       // Running total of ETH donated
        bool    goalReached;       // Flips to true once totalRaised >= goalAmount
        bool    isCancelled;
    }

    /// @dev One milestone the creator submits after goal is reached
    ///      e.g. "Bought construction materials — here's the receipt"
    struct Milestone {
        uint256 id;
        string  description;       // What the creator claims they spent on
        uint256 releaseAmount;     // How much ETH to release if approved
        bool    isApproved;        // True once majority of donors vote yes
        bool    isRejected;        // True once majority vote no
        uint256 approveVotes;
        uint256 rejectVotes;
    }


    // ================================================================
    //  SECTION 2 — STATE VARIABLES
    //  These live permanently on the blockchain
    // ================================================================

    uint256 public totalCampaigns;  // Auto-increments with each new campaign

    // campaignId => Campaign
    mapping(uint256 => Campaign) public campaigns;

    // campaignId => milestoneId => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;

    // campaignId => total milestones created
    mapping(uint256 => uint256) public milestoneCount;

    // campaignId => donor address => amount donated
    mapping(uint256 => mapping(address => uint256)) public donations;

    // campaignId => list of all donor addresses
    mapping(uint256 => address[]) public donors;

    // campaignId => milestoneId => voter address => has voted?
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;


    // ================================================================
    //  SECTION 3 — EVENTS
    //  Like notifications — frontend listens to these in real time
    // ================================================================

    event CampaignCreated  (uint256 indexed campaignId, address creator, string title, uint256 goal, uint256 deadline);
    event DonationReceived (uint256 indexed campaignId, address donor,   uint256 amount, uint256 totalRaised);
    event GoalReached      (uint256 indexed campaignId, uint256 totalRaised);
    event MilestoneAdded   (uint256 indexed campaignId, uint256 milestoneId, string description, uint256 releaseAmount);
    event MilestoneVoted   (uint256 indexed campaignId, uint256 milestoneId, address voter, bool approved);
    event FundsReleased    (uint256 indexed campaignId, uint256 milestoneId, uint256 amount);
    event MilestoneRejected(uint256 indexed campaignId, uint256 milestoneId);
    event RefundClaimed    (uint256 indexed campaignId, address donor, uint256 amount);


    // ================================================================
    //  SECTION 4 — MODIFIERS
    //  Reusable rules that guard functions (like a bouncer at the door)
    // ================================================================

    /// @dev Only the person who created this campaign can call this
    modifier onlyCreator(uint256 _campaignId) {
        require(
            msg.sender == campaigns[_campaignId].creator,
            "Only the campaign creator can do this"
        );
        _;
    }

    /// @dev Campaign must exist
    modifier exists(uint256 _campaignId) {
        require(_campaignId < totalCampaigns, "Campaign does not exist");
        _;
    }

    /// @dev Campaign must still be active (not cancelled, not past deadline)
    modifier isActive(uint256 _campaignId) {
        require(!campaigns[_campaignId].isCancelled, "Campaign is cancelled");
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign deadline has passed");
        _;
    }


    // ================================================================
    //  SECTION 5 — MAIN FUNCTIONS
    // ================================================================

    // ── 5A. CREATE CAMPAIGN ─────────────────────────────────────────

    /// @notice Start a new fundraising campaign
    /// @param _title       Short name e.g. "Medical bills for Raju"
    /// @param _description Full story of the campaign
    /// @param _goalInEther How much ETH to raise e.g. 1 = 1 ETH
    /// @param _daysToRaise How many days donors have to contribute (1–90)
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goalInEther,
        uint256 _daysToRaise
    ) external {
        require(bytes(_title).length > 0,                        "Title cannot be empty");
        require(bytes(_description).length > 0,                  "Description cannot be empty");
        require(_goalInEther > 0,                                "Goal must be greater than 0");
        require(_daysToRaise >= 1 && _daysToRaise <= 90,        "Duration must be between 1 and 90 days");

        uint256 id = totalCampaigns;

        campaigns[id] = Campaign({
            id           : id,
            creator      : payable(msg.sender),
            title        : _title,
            description  : _description,
            goalAmount   : _goalInEther * 1 ether,
            deadline     : block.timestamp + (_daysToRaise * 1 days),
            totalRaised  : 0,
            goalReached  : false,
            isCancelled  : false
        });

        totalCampaigns++;

        emit CampaignCreated(id, msg.sender, _title, _goalInEther * 1 ether, campaigns[id].deadline);
    }


    // ── 5B. DONATE ──────────────────────────────────────────────────

    /// @notice Send ETH to support a campaign
    /// @param _campaignId The ID of the campaign to donate to
    function donate(uint256 _campaignId)
        external
        payable
        exists(_campaignId)
        isActive(_campaignId)
    {
        require(msg.value > 0, "You must send some ETH");

        Campaign storage c = campaigns[_campaignId];

        // First-time donor — add to the donors list
        if (donations[_campaignId][msg.sender] == 0) {
            donors[_campaignId].push(msg.sender);
        }

        donations[_campaignId][msg.sender] += msg.value;
        c.totalRaised += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value, c.totalRaised);

        // Check if goal is now reached
        if (!c.goalReached && c.totalRaised >= c.goalAmount) {
            c.goalReached = true;
            emit GoalReached(_campaignId, c.totalRaised);
        }
    }


    // ── 5C. ADD MILESTONE ───────────────────────────────────────────

    /// @notice Creator submits a milestone to request fund release
    /// @param _campaignId    Which campaign this belongs to
    /// @param _description   What you did / what the money is for
    /// @param _amountInEther How much ETH you are requesting to release
    function addMilestone(
        uint256 _campaignId,
        string memory _description,
        uint256 _amountInEther
    )
        external
        exists(_campaignId)
        onlyCreator(_campaignId)
    {
        require(campaigns[_campaignId].goalReached, "Goal not reached yet - wait for donations");        require(bytes(_description).length > 0,           "Milestone description required");
        require(_amountInEther > 0,                       "Release amount must be greater than 0");
        require(
            _amountInEther * 1 ether <= address(this).balance,
            "Requested amount exceeds available funds"
        );

        uint256 mid = milestoneCount[_campaignId];

        milestones[_campaignId][mid] = Milestone({
            id            : mid,
            description   : _description,
            releaseAmount : _amountInEther * 1 ether,
            isApproved    : false,
            isRejected    : false,
            approveVotes  : 0,
            rejectVotes   : 0
        });

        milestoneCount[_campaignId]++;

        emit MilestoneAdded(_campaignId, mid, _description, _amountInEther * 1 ether);
    }


    // ── 5D. VOTE ON MILESTONE ───────────────────────────────────────

    /// @notice Donors vote to approve or reject a fund release request
    /// @param _campaignId  Which campaign
    /// @param _milestoneId Which milestone to vote on
    /// @param _approve     true = approve release, false = reject
    function vote(
        uint256 _campaignId,
        uint256 _milestoneId,
        bool    _approve
    ) external exists(_campaignId) {
        require(donations[_campaignId][msg.sender] > 0, "Only donors can vote");
        require(!hasVoted[_campaignId][_milestoneId][msg.sender], "You have already voted");

        Milestone storage m = milestones[_campaignId][_milestoneId];
        require(!m.isApproved,  "Milestone already approved");
        require(!m.isRejected,  "Milestone already rejected");

        hasVoted[_campaignId][_milestoneId][msg.sender] = true;

        uint256 totalDonors = donors[_campaignId].length;

        if (_approve) {
            m.approveVotes++;
            emit MilestoneVoted(_campaignId, _milestoneId, msg.sender, true);

            // Approved when MORE than 50% of donors say yes
            if (m.approveVotes * 2 > totalDonors) {
                m.isApproved = true;
                campaigns[_campaignId].creator.transfer(m.releaseAmount);
                emit FundsReleased(_campaignId, _milestoneId, m.releaseAmount);
            }

        } else {
            m.rejectVotes++;
            emit MilestoneVoted(_campaignId, _milestoneId, msg.sender, false);

            // Rejected when MORE than 50% of donors say no
            if (m.rejectVotes * 2 > totalDonors) {
                m.isRejected = true;
                emit MilestoneRejected(_campaignId, _milestoneId);
            }
        }
    }


    // ── 5E. CLAIM REFUND ────────────────────────────────────────────

    /// @notice If the goal wasn't met by deadline, donors can get their money back
    /// @param _campaignId Which campaign to refund from
    function claimRefund(uint256 _campaignId) external exists(_campaignId) {
        Campaign storage c = campaigns[_campaignId];

        require(block.timestamp >= c.deadline, "Campaign is still running");
        require(!c.goalReached,                "Goal was reached - no refund available");

        uint256 amount = donations[_campaignId][msg.sender];
        require(amount > 0, "You have no donation to refund");

        // Zero out before transferring (prevents re-entrancy attacks)
        donations[_campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit RefundClaimed(_campaignId, msg.sender, amount);
    }


    // ================================================================
    //  SECTION 6 — READ FUNCTIONS (free to call — no gas needed)
    // ================================================================

    /// @notice Get all details of a campaign
    function getCampaign(uint256 _campaignId)
        external
        view
        exists(_campaignId)
        returns (Campaign memory)
    {
        return campaigns[_campaignId];
    }

    /// @notice Get all details of a milestone
    function getMilestone(uint256 _campaignId, uint256 _milestoneId)
        external
        view
        returns (Milestone memory)
    {
        return milestones[_campaignId][_milestoneId];
    }

    /// @notice How much has a specific donor contributed to a campaign
    function getMyDonation(uint256 _campaignId)
        external
        view
        returns (uint256)
    {
        return donations[_campaignId][msg.sender];
    }

    /// @notice Get total number of donors for a campaign
    function getDonorCount(uint256 _campaignId)
        external
        view
        exists(_campaignId)
        returns (uint256)
    {
        return donors[_campaignId].length;
    }

    /// @notice Get time remaining for a campaign in seconds (0 if ended)
    function getTimeRemaining(uint256 _campaignId)
        external
        view
        exists(_campaignId)
        returns (uint256)
    {
        if (block.timestamp >= campaigns[_campaignId].deadline) return 0;
        return campaigns[_campaignId].deadline - block.timestamp;
    }
}