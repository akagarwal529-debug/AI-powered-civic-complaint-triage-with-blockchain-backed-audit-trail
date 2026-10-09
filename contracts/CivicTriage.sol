// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CivicTriage
 * @notice Immutable registry for AI-triaged civic complaints.
 *         Citizens earn tokens for reporting valid issues.
 */
contract CivicTriage {

    // ─────────────────────────────────────────────────────────────
    // STRUCTS
    // ─────────────────────────────────────────────────────────────

    struct Complaint {
        uint256 id;
        string ipfsHash;      // IPFS hash of full AI-structured JSON
        uint8 severity;       // 1 = low, 5 = critical
        string department;    // e.g. "Public Works"
        address reporter;     // citizen who filed it
        uint256 timestamp;    // block.timestamp at submission
        bool resolved;        // true once admin resolves
    }

    // ─────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────

    uint256 public complaintCount;
    mapping(uint256 => Complaint) public complaints;
    mapping(address => uint256) public civicTokens;

    uint256 public constant REWARD_PER_REPORT = 10 * 10**18; // 10 tokens

    address public owner;

    // ─────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────

    event ComplaintFiled(
        uint256 indexed id,
        address indexed reporter,
        uint8 severity,
        string department,
        string ipfsHash
    );

    event ComplaintResolved(
        uint256 indexed id,
        address indexed resolver
    );

    // ─────────────────────────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // ─────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────────────────────────
    // WRITE FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    function fileComplaint(
        string memory _ipfsHash,
        uint8 _severity,
        string memory _department,
        address _reporter
    ) public returns (uint256) {
        require(_severity >= 1 && _severity <= 5, "Severity must be 1-5");
        require(_reporter != address(0), "Invalid reporter");

        complaintCount++;

        complaints[complaintCount] = Complaint({
            id: complaintCount,
            ipfsHash: _ipfsHash,
            severity: _severity,
            department: _department,
            reporter: _reporter,
            timestamp: block.timestamp,
            resolved: false
        });

        civicTokens[_reporter] += REWARD_PER_REPORT;

        emit ComplaintFiled(complaintCount, _reporter, _severity, _department, _ipfsHash);

        return complaintCount;
    }

    function resolveComplaint(uint256 _id) public onlyOwner {
        require(_id > 0 && _id <= complaintCount, "Invalid complaint ID");
        require(!complaints[_id].resolved, "Already resolved");

        complaints[_id].resolved = true;

        emit ComplaintResolved(_id, msg.sender);
    }

    // ─────────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────

    function getComplaintsByReporter(address _reporter)
        public
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= complaintCount; i++) {
            if (complaints[i].reporter == _reporter) count++;
        }

        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 1; i <= complaintCount; i++) {
            if (complaints[i].reporter == _reporter) {
                result[j] = i;
                j++;
            }
        }
        return result;
    }

    function getUnresolvedCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= complaintCount; i++) {
            if (!complaints[i].resolved) count++;
        }
        return count;
    }
}