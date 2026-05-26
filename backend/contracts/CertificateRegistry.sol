// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateRegistry {
    error UnauthorizedIssuer();
    error UnauthorizedOwner();
    error InvalidCertificateId();
    error CertificateAlreadyAnchored();

    struct AnchorRecord {
        bytes32 contentHash;
        string templateType;
        address issuer;
        uint64 timestamp;
    }

    address public immutable owner;
    mapping(address => bool) public isIssuer;
    mapping(string => AnchorRecord) private anchors;

    event IssuerUpdated(address indexed issuer, bool allowed);
    event CertificateAnchored(
        string indexed certificateId,
        bytes32 indexed contentHash,
        string templateType,
        address indexed issuer,
        uint64 timestamp
    );

    constructor() {
        owner = msg.sender;
        isIssuer[msg.sender] = true;
        emit IssuerUpdated(msg.sender, true);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedOwner();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert UnauthorizedIssuer();
        _;
    }

    function setIssuer(address issuer, bool allowed) external onlyOwner {
        isIssuer[issuer] = allowed;
        emit IssuerUpdated(issuer, allowed);
    }

    function anchorCertificate(
        string calldata certificateId,
        bytes32 contentHash,
        string calldata templateType
    ) external onlyIssuer returns (bytes32 anchorKey) {
        if (bytes(certificateId).length == 0) revert InvalidCertificateId();
        if (anchors[certificateId].timestamp != 0) revert CertificateAlreadyAnchored();

        uint64 timestamp = uint64(block.timestamp);
        anchors[certificateId] = AnchorRecord({
            contentHash: contentHash,
            templateType: templateType,
            issuer: msg.sender,
            timestamp: timestamp
        });

        emit CertificateAnchored(certificateId, contentHash, templateType, msg.sender, timestamp);

        return keccak256(abi.encodePacked(certificateId, contentHash, templateType, msg.sender, timestamp));
    }

    function getAnchor(
        string calldata certificateId
    )
        external
        view
        returns (bytes32 contentHash, string memory templateType, address issuer, uint64 timestamp)
    {
        AnchorRecord memory record = anchors[certificateId];
        return (record.contentHash, record.templateType, record.issuer, record.timestamp);
    }
}
