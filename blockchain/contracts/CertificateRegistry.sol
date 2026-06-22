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
    
    struct BatchCertificate {
        bytes32 hash;
        uint256 timestamp;
        address issuer;
        bool isRevoked;
        uint256 blockNumber;
        uint256 batchId;
    }
    
    struct MerkleBatch {
        bytes32 merkleRoot;
        uint256 timestamp;
        address issuer;
        bool isValid;
        uint256 certificateCount;
        bytes32[] leaves;
    }
    
    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => BatchCertificate) public batchCertificates;
    mapping(uint256 => MerkleBatch) public merkleBatches;
    
    mapping(address => uint256) public issuerTotalCertificates;
    mapping(address => uint256) public issuerActiveCertificates;
    mapping(address => uint256) public issuerRevokedCertificates;
    mapping(address => uint256) public issuerTotalTransactions;
    
    event CertificateStored(
        bytes32 indexed hash,
        address indexed issuer,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event BatchCertificateStored(
        bytes32 indexed hash,
        address indexed issuer,
        uint256 indexed batchId,
        uint256 timestamp
    );
    
    event MerkleBatchStored(
        uint256 indexed batchId,
        bytes32 merkleRoot,
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
        uint256 indexed batchId,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );
    
    constructor() {}
    
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
    
    function storeBatchCertificate(
        bytes32 _hash,
        uint256 _batchId,
        string memory _metadata
    ) external {
        require(_hash != bytes32(0), "Invalid hash");
        require(!batchCertificates[_hash].isRevoked, "Certificate already revoked");
        require(batchCertificates[_hash].hash == bytes32(0), "Certificate already exists");
        
        batchCertificates[_hash] = BatchCertificate({
            hash: _hash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isRevoked: false,
            blockNumber: block.number,
            batchId: _batchId
        });
        
        issuerTotalCertificates[msg.sender]++;
        issuerActiveCertificates[msg.sender]++;
        issuerTotalTransactions[msg.sender]++;
        
        emit BatchCertificateStored(_hash, msg.sender, _batchId, block.timestamp);
    }
    
    function storeMerkleBatch(
        uint256 _batchId,
        bytes32 _merkleRoot,
        bytes32[] memory _leaves,
        uint256 _certificateCount
    ) external {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(!merkleBatches[_batchId].isValid, "Batch already exists");
        
        merkleBatches[_batchId] = MerkleBatch({
            merkleRoot: _merkleRoot,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isValid: true,
            certificateCount: _certificateCount,
            leaves: _leaves
        });
        
        issuerTotalCertificates[msg.sender] += _certificateCount;
        issuerActiveCertificates[msg.sender] += _certificateCount;
        issuerTotalTransactions[msg.sender]++;
        
        emit MerkleBatchStored(_batchId, _merkleRoot, msg.sender, _certificateCount, block.timestamp);
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
    
    function revokeBatchCertificate(bytes32 _hash, string memory _reason) external {
        require(batchCertificates[_hash].hash != bytes32(0), "Certificate not found");
        require(batchCertificates[_hash].issuer == msg.sender, "Not authorized");
        require(!batchCertificates[_hash].isRevoked, "Already revoked");
        
        batchCertificates[_hash].isRevoked = true;
        issuerActiveCertificates[msg.sender]--;
        issuerRevokedCertificates[msg.sender]++;
        issuerTotalTransactions[msg.sender]++;
        
        emit CertificateRevoked(_hash, msg.sender, _reason, block.timestamp);
    }
    
    function revokeMerkleBatch(uint256 _batchId, string memory _reason) external {
        require(merkleBatches[_batchId].isValid, "Batch not found");
        require(merkleBatches[_batchId].issuer == msg.sender, "Not authorized");
        
        merkleBatches[_batchId].isValid = false;
        issuerActiveCertificates[msg.sender] -= merkleBatches[_batchId].certificateCount;
        issuerRevokedCertificates[msg.sender] += merkleBatches[_batchId].certificateCount;
        issuerTotalTransactions[msg.sender]++;
        
        emit BatchRevoked(_batchId, msg.sender, _reason, block.timestamp);
    }
    
    function verifyCertificate(bytes32 _hash) external view returns (
        bool exists,
        bool isRevoked,
        address issuer,
        uint256 timestamp,
        string memory revocationReason
    ) {
        Certificate memory cert = certificates[_hash];
        if (cert.hash == bytes32(0)) {
            BatchCertificate memory batchCert = batchCertificates[_hash];
            if (batchCert.hash != bytes32(0)) {
                return (true, batchCert.isRevoked, batchCert.issuer, batchCert.timestamp, "");
            }
            return (false, false, address(0), 0, "");
        }
        return (true, cert.isRevoked, cert.issuer, cert.timestamp, cert.revocationReason);
    }
    
    function verifyMerkleProof(bytes32 _leaf, bytes32[] memory _proof, uint256 _batchId) external view returns (bool) {
        MerkleBatch storage batch = merkleBatches[_batchId];
        require(batch.isValid, "Invalid batch");
        
        bytes32 computedHash = _leaf;
        for (uint256 i = 0; i < _proof.length; i++) {
            computedHash = _proof[i] < computedHash ? 
                keccak256(abi.encodePacked(_proof[i], computedHash)) :
                keccak256(abi.encodePacked(computedHash, _proof[i]));
        }
        return computedHash == batch.merkleRoot;
    }
    
    function getIssuerStats(address _issuer) external view returns (
        uint256 totalCertificates,
        uint256 activeCertificates,
        uint256 revokedCertificates,
        uint256 totalTransactions
    ) {
        return (
            issuerTotalCertificates[_issuer],
            issuerActiveCertificates[_issuer],
            issuerRevokedCertificates[_issuer],
            issuerTotalTransactions[_issuer]
        );
    }
}