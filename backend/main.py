import os
import json
import hashlib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from dotenv import load_dotenv

from ai_engine import triage_complaint

load_dotenv()

app = FastAPI(title="CivicTriage AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Web3 setup
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
CONTRACT_ADDRESS = Web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

CONTRACT_ABI = [
    {
        "inputs": [
            {"name": "_ipfsHash", "type": "string"},
            {"name": "_severity", "type": "uint8"},
            {"name": "_department", "type": "string"},
            {"name": "_reporter", "type": "address"},
        ],
        "name": "fileComplaint",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"name": "_id", "type": "uint256"}],
        "name": "resolveComplaint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "complaintCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"name": "", "type": "uint256"}],
        "name": "complaints",
        "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "ipfsHash", "type": "string"},
            {"name": "severity", "type": "uint8"},
            {"name": "department", "type": "string"},
            {"name": "reporter", "type": "address"},
            {"name": "timestamp", "type": "uint256"},
            {"name": "resolved", "type": "bool"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

COMPLAINTS_DIR = Path(__file__).parent / "complaints"
COMPLAINTS_DIR.mkdir(exist_ok=True)


class ComplaintRequest(BaseModel):
    text: str
    reporter_address: str


class ResolveRequest(BaseModel):
    complaint_id: int

@app.get("/balance/{address}")
async def get_balance(address: str):
    try:
        checksum = Web3.to_checksum_address(address)
        # civicTokens is a public mapping on the contract
        # We need to add it to ABI — see note below
        civic_abi = [
            {
                "inputs": [{"name": "", "type": "address"}],
                "name": "civicTokens",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function",
            }
        ]
        temp = w3.eth.contract(address=CONTRACT_ADDRESS, abi=civic_abi)
        raw = temp.functions.civicTokens(checksum).call()
        balance = w3.from_wei(raw, "ether")
        return {"address": address, "balance": str(balance)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _pseudo_ipfs_hash(data: dict) -> str:
    """Generate a deterministic hash to act as the content identifier."""
    return "Qm" + hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:44]


@app.get("/")
def root():
    return {
        "status": "CivicTriage AI running",
        "contract": CONTRACT_ADDRESS,
        "complaint_count": contract.functions.complaintCount().call(),
    }


@app.post("/submit")
async def submit_complaint(req: ComplaintRequest):
    try:
        # Step 1: AI triage
        structured = triage_complaint(req.text)

        # Step 2: Save full record locally (mimics IPFS)
        full_record = {**structured, "raw_text": req.text, "reporter": req.reporter_address}
        ipfs_hash = _pseudo_ipfs_hash(full_record)
        (COMPLAINTS_DIR / f"{ipfs_hash}.json").write_text(json.dumps(full_record, indent=2))

        # Step 3: Send transaction to blockchain
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)

        tx = contract.functions.fileComplaint(
            ipfs_hash,
            int(structured["severity"]),
            structured["department"],
            Web3.to_checksum_address(req.reporter_address),
        ).build_transaction({
            "chainId": 31337,
            "gas": 500_000,
            "gasPrice": w3.to_wei("1", "gwei"),
            "nonce": nonce,
            "from": account.address,
        })

        signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "structured": structured,
            "ipfs_hash": ipfs_hash,
            "tx_hash": tx_hash.hex(),
            "block": receipt.blockNumber,
            "status": "success",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/complaints")
async def list_complaints():
    try:
        total = contract.functions.complaintCount().call()
        items = []
        for i in range(1, total + 1):
            c = contract.functions.complaints(i).call()
            # Load the off-chain JSON if it exists
            json_path = COMPLAINTS_DIR / f"{c[1]}.json"
            structured = None
            if json_path.exists():
                structured = json.loads(json_path.read_text())
            items.append({
                "id": c[0],
                "ipfs_hash": c[1],
                "severity": c[2],
                "department": c[3],
                "reporter": c[4],
                "timestamp": c[5],
                "resolved": c[6],
                "structured": structured,
            })
        # Sort by severity desc (most urgent first)
        items.sort(key=lambda x: (-x["severity"], x["id"]))
        return {"complaints": items, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resolve")
async def resolve_complaint(req: ResolveRequest):
    try:
        account = w3.eth.account.from_key(PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)

        tx = contract.functions.resolveComplaint(req.complaint_id).build_transaction({
            "chainId": 31337,
            "gas": 200_000,
            "gasPrice": w3.to_wei("1", "gwei"),
            "nonce": nonce,
            "from": account.address,
        })

        signed = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)

        return {"tx_hash": tx_hash.hex(), "status": "resolved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))