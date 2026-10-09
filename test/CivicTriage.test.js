const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CivicTriage", function () {
  let civic;
  let owner;
  let citizen;
  let citizen2;

  beforeEach(async function () {
    [owner, citizen, citizen2] = await ethers.getSigners();
    const Civic = await ethers.getContractFactory("CivicTriage");
    civic = await Civic.deploy();
    await civic.waitForDeployment();
  });

  // ─────────────────────────────────────────────────────────────
  // DEPLOYMENT
  // ─────────────────────────────────────────────────────────────

  it("Should set the deployer as owner", async function () {
    expect(await civic.owner()).to.equal(owner.address);
  });

  it("Should start with zero complaints", async function () {
    expect(await civic.complaintCount()).to.equal(0);
  });

  // ─────────────────────────────────────────────────────────────
  // FILING COMPLAINTS
  // ─────────────────────────────────────────────────────────────

  it("Should file a complaint and store it correctly", async function () {
    await civic.fileComplaint(
      "QmTestHash",
      5,
      "Public Works",
      citizen.address
    );

    expect(await civic.complaintCount()).to.equal(1);

    const complaint = await civic.complaints(1);
    expect(complaint.id).to.equal(1);
    expect(complaint.ipfsHash).to.equal("QmTestHash");
    expect(complaint.severity).to.equal(5);
    expect(complaint.department).to.equal("Public Works");
    expect(complaint.reporter).to.equal(citizen.address);
    expect(complaint.resolved).to.equal(false);
  });

  it("Should emit ComplaintFiled event", async function () {
    await expect(
      civic.fileComplaint("QmHash", 4, "Sanitation", citizen.address)
    )
      .to.emit(civic, "ComplaintFiled")
      .withArgs(1, citizen.address, 4, "Sanitation", "QmHash");
  });

  it("Should reject severity 0", async function () {
    await expect(
      civic.fileComplaint("Qm", 0, "Public Works", citizen.address)
    ).to.be.revertedWith("Severity must be 1-5");
  });

  it("Should reject severity 6", async function () {
    await expect(
      civic.fileComplaint("Qm", 6, "Public Works", citizen.address)
    ).to.be.revertedWith("Severity must be 1-5");
  });

  it("Should reject zero address reporter", async function () {
    await expect(
      civic.fileComplaint("Qm", 3, "Public Works", ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid reporter");
  });

  // ─────────────────────────────────────────────────────────────
  // TOKEN REWARDS
  // ─────────────────────────────────────────────────────────────

  it("Should reward 10 tokens per complaint", async function () {
    await civic.fileComplaint("Qm", 5, "Public Works", citizen.address);
    const reward = await civic.civicTokens(citizen.address);
    expect(reward).to.equal(ethers.parseEther("10"));
  });

  it("Should accumulate rewards across multiple complaints", async function () {
    await civic.fileComplaint("Qm1", 3, "Sanitation", citizen.address);
    await civic.fileComplaint("Qm2", 4, "Water Board", citizen.address);
    await civic.fileComplaint("Qm3", 5, "Public Works", citizen.address);

    const reward = await civic.civicTokens(citizen.address);
    expect(reward).to.equal(ethers.parseEther("30"));
  });

  it("Should track rewards separately per citizen", async function () {
    await civic.fileComplaint("Qm1", 3, "Sanitation", citizen.address);
    await civic.fileComplaint("Qm2", 4, "Water Board", citizen2.address);

    expect(await civic.civicTokens(citizen.address)).to.equal(
      ethers.parseEther("10")
    );
    expect(await civic.civicTokens(citizen2.address)).to.equal(
      ethers.parseEther("10")
    );
  });

  // ─────────────────────────────────────────────────────────────
  // RESOLUTION
  // ─────────────────────────────────────────────────────────────

  it("Should allow owner to resolve a complaint", async function () {
    await civic.fileComplaint("Qm", 5, "Public Works", citizen.address);
    await civic.resolveComplaint(1);

    const complaint = await civic.complaints(1);
    expect(complaint.resolved).to.equal(true);
  });

  it("Should emit ComplaintResolved event", async function () {
    await civic.fileComplaint("Qm", 5, "Public Works", citizen.address);

    await expect(civic.resolveComplaint(1))
      .to.emit(civic, "ComplaintResolved")
      .withArgs(1, owner.address);
  });

  it("Should prevent double resolution", async function () {
    await civic.fileComplaint("Qm", 5, "Public Works", citizen.address);
    await civic.resolveComplaint(1);

    await expect(civic.resolveComplaint(1)).to.be.revertedWith(
      "Already resolved"
    );
  });

  it("Should prevent non-owner from resolving", async function () {
    await civic.fileComplaint("Qm", 5, "Public Works", citizen.address);

    await expect(
      civic.connect(citizen).resolveComplaint(1)
    ).to.be.revertedWith("Not authorized");
  });

  it("Should revert on invalid complaint ID", async function () {
    await expect(civic.resolveComplaint(999)).to.be.revertedWith(
      "Invalid complaint ID"
    );
  });

  // ─────────────────────────────────────────────────────────────
  // VIEW HELPERS
  // ─────────────────────────────────────────────────────────────

  it("Should return complaints by reporter", async function () {
    await civic.fileComplaint("Qm1", 3, "Sanitation", citizen.address);
    await civic.fileComplaint("Qm2", 4, "Water Board", citizen2.address);
    await civic.fileComplaint("Qm3", 5, "Public Works", citizen.address);

    const citizenIds = await civic.getComplaintsByReporter(citizen.address);
    expect(citizenIds.length).to.equal(2);
    expect(citizenIds[0]).to.equal(1);
    expect(citizenIds[1]).to.equal(3);

    const citizen2Ids = await civic.getComplaintsByReporter(citizen2.address);
    expect(citizen2Ids.length).to.equal(1);
    expect(citizen2Ids[0]).to.equal(2);
  });

  it("Should count unresolved complaints", async function () {
    await civic.fileComplaint("Qm1", 3, "Sanitation", citizen.address);
    await civic.fileComplaint("Qm2", 4, "Water Board", citizen.address);
    await civic.fileComplaint("Qm3", 5, "Public Works", citizen.address);

    expect(await civic.getUnresolvedCount()).to.equal(3);

    await civic.resolveComplaint(2);

    expect(await civic.getUnresolvedCount()).to.equal(2);
  });

  it("Should return empty array for reporter with no complaints", async function () {
    const ids = await civic.getComplaintsByReporter(citizen.address);
    expect(ids.length).to.equal(0);
  });
});