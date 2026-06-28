// backend/src/contracts/CertificateRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {
    struct Certificate {
        bytes32 hash;
        uint256 timestamp;
        address issuer;
        bool isRevoked;
        string revocationReason;
        uint256 blockNumber;
    }
    
    struct MerkleBatch {
        bytes32 merkleRoot;
        string metadata;
        uint256 certificateCount;
        uint256 timestamp;
        address issuer;
        bool isValid;
    }
    
    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => MerkleBatch) public merkleBatches;
    mapping(bytes32 => bool) public merkleBatchExists;
    
    mapping(address => uint256) public issuerTotalCertificates;
    mapping(address => uint256) public issuerActiveCertificates;
    mapping(address => uint256) public issuerRevokedCertificates;
    mapping(address => uint256) public issuerTotalTransactions;
    mapping(address => uint256) public issuerTotalBatches;
    
    uint256 public batchIdCounter;
    
    event CertificateStored(
        bytes32 indexed hash,
        address indexed issuer,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event MerkleBatchStored(
        uint256 indexed batchId,
        bytes32 indexed merkleRoot,
        address indexed issuer,
        uint256 certificateCount,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        bytes32 indexed hash,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );
    
    event BatchRevoked(
        bytes32 indexed merkleRoot,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );
    
    constructor() {
        batchIdCounter = 0;
    }
    
    function storeCertificate(
        bytes32 _hash,
        string memory _metadata
    ) external {
        require(_hash != bytes32(0), "Invalid hash");
        require(!certificates[_hash].isRevoked, "Certificate already revoked");
        require(certificates[_hash].hash == bytes32(0), "Certificate already exists");
        
        certificates[_hash] = Certificate({
            hash: _hash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isRevoked: false,
            revocationReason: "",
            blockNumber: block.number
        });
        
        issuerTotalCertificates[msg.sender]++;
        issuerActiveCertificates[msg.sender]++;
        issuerTotalTransactions[msg.sender]++;
        
        emit CertificateStored(_hash, msg.sender, block.timestamp, block.number);
    }
    
    function storeMerkleBatch(
        bytes32 _merkleRoot,
        string memory _metadata,
        uint256 _certificateCount
    ) external returns (uint256 batchId) {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(_certificateCount > 0, "At least one certificate required");
        require(!merkleBatchExists[_merkleRoot], "Batch already exists");
        
        // Increment batch ID
        batchIdCounter++;
        batchId = batchIdCounter;
        
        merkleBatches[_merkleRoot] = MerkleBatch({
            merkleRoot: _merkleRoot,
            metadata: _metadata,
            certificateCount: _certificateCount,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isValid: true
        });
        
        merkleBatchExists[_merkleRoot] = true;
        
        issuerTotalCertificates[msg.sender] += _certificateCount;
        issuerActiveCertificates[msg.sender] += _certificateCount;
        issuerTotalTransactions[msg.sender]++;
        issuerTotalBatches[msg.sender]++;
        
        emit MerkleBatchStored(batchId, _merkleRoot, msg.sender, _certificateCount, block.timestamp);
        
        return batchId;
    }
    
    function revokeCertificate(bytes32 _hash, string memory _reason) external {
        require(certificates[_hash].hash != bytes32(0), "Certificate not found");
        require(certificates[_hash].issuer == msg.sender, "Not authorized");
        require(!certificates[_hash].isRevoked, "Already revoked");
        
        certificates[_hash].isRevoked = true;
        certificates[_hash].revocationReason = _reason;
        
        issuerActiveCertificates[msg.sender]--;
        issuerRevokedCertificates[msg.sender]++;
        issuerTotalTransactions[msg.sender]++;
        
        emit CertificateRevoked(_hash, msg.sender, _reason, block.timestamp);
    }
    
    function revokeMerkleBatch(bytes32 _merkleRoot, string memory _reason) external {
        require(merkleBatchExists[_merkleRoot], "Batch not found");
        require(merkleBatches[_merkleRoot].issuer == msg.sender, "Not authorized");
        require(merkleBatches[_merkleRoot].isValid, "Batch already revoked");
        
        merkleBatches[_merkleRoot].isValid = false;
        
        uint256 count = merkleBatches[_merkleRoot].certificateCount;
        issuerActiveCertificates[msg.sender] -= count;
        issuerRevokedCertificates[msg.sender] += count;
        issuerTotalTransactions[msg.sender]++;
        
        emit BatchRevoked(_merkleRoot, msg.sender, _reason, block.timestamp);
    }
    
    function verifyCertificate(bytes32 _hash)
        external
        view
        returns(
            bool exists,
            bool isRevoked,
            address issuer,
            uint256 timestamp,
            string memory revocationReason
        )
    {
        Certificate memory cert = certificates[_hash];

        if(cert.hash == bytes32(0)) {
            return(
                false,
                false,
                address(0),
                0,
                ""
            );
        }

        return(
            true,
            cert.isRevoked,
            cert.issuer,
            cert.timestamp,
            cert.revocationReason
        );
    }
    
    function verifyMerkleProof(
        bytes32 _leaf,
        bytes32[] memory _proof,
        bytes32 _merkleRoot
    ) external view returns (bool) {
        require(merkleBatchExists[_merkleRoot], "Batch not found");
        require(merkleBatches[_merkleRoot].isValid, "Batch revoked");
        
        MerkleBatch memory batch = merkleBatches[_merkleRoot];
        bytes32 computedHash = _leaf;
        
        for (uint256 i = 0; i < _proof.length; i++) {
            if (_proof[i] < computedHash) {
                computedHash = keccak256(abi.encodePacked(_proof[i], computedHash));
            } else {
                computedHash = keccak256(abi.encodePacked(computedHash, _proof[i]));
            }
        }
        
        return computedHash == batch.merkleRoot;
    }
    
    function verifyMerkleBatch(
        bytes32 _merkleRoot
    )
        external
        view
        returns(
            bool exists,
            bool isValid,
            address issuer,
            uint256 certificateCount,
            uint256 timestamp,
            string memory metadata
        )
    {
        if(!merkleBatchExists[_merkleRoot]) {
            return(
                false,
                false,
                address(0),
                0,
                0,
                ""
            );
        }
        
        MerkleBatch memory batch = merkleBatches[_merkleRoot];
        
        return(
            true,
            batch.isValid,
            batch.issuer,
            batch.certificateCount,
            batch.timestamp,
            batch.metadata
        );
    }
    
    function getBatchInfo(
        bytes32 _merkleRoot
    )
        external
        view
        returns(
            bytes32 merkleRoot,
            string memory metadata,
            uint256 certificateCount,
            uint256 timestamp,
            address issuer,
            bool isValid
        )
    {
        require(merkleBatchExists[_merkleRoot], "Batch not found");
        
        MerkleBatch memory batch = merkleBatches[_merkleRoot];
        
        return(
            batch.merkleRoot,
            batch.metadata,
            batch.certificateCount,
            batch.timestamp,
            batch.issuer,
            batch.isValid
        );
    }
    
    function getCertificateCount()
        external
        view
        returns(uint256)
    {
        return issuerTotalCertificates[msg.sender];
    }
    
    function getIssuerStats(address _issuer) external view returns (
        uint256 totalCertificates,
        uint256 activeCertificates,
        uint256 revokedCertificates,
        uint256 totalTransactions,
        uint256 totalBatches
    ) {
        return (
            issuerTotalCertificates[_issuer],
            issuerActiveCertificates[_issuer],
            issuerRevokedCertificates[_issuer],
            issuerTotalTransactions[_issuer],
            issuerTotalBatches[_issuer]
        );
    }
}