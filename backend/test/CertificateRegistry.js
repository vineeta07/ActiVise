const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  async function deployFixture() {
    const [owner, issuer, outsider] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("CertificateRegistry");
    const registry = await factory.deploy();
    await registry.waitForDeployment();

    return { registry, owner, issuer, outsider };
  }

  it("sets deployer as owner and default issuer", async function () {
    const { registry, owner } = await deployFixture();

    expect(await registry.owner()).to.equal(owner.address);
    expect(await registry.isIssuer(owner.address)).to.equal(true);
  });

  it("allows owner to authorize another issuer", async function () {
    const { registry, owner, issuer } = await deployFixture();

    await registry.connect(owner).setIssuer(issuer.address, true);
    expect(await registry.isIssuer(issuer.address)).to.equal(true);
  });

  it("rejects non-owner issuer updates", async function () {
    const { registry, outsider, issuer } = await deployFixture();

    await expect(registry.connect(outsider).setIssuer(issuer.address, true)).to.be.revertedWithCustomError(
      registry,
      "UnauthorizedOwner"
    );
  });

  it("anchors certificate hash and metadata", async function () {
    const { registry, owner } = await deployFixture();
    const certificateId = "CIV-12345678";
    const templateType = "volunteer";
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("sample-certificate-payload"));

    await registry.connect(owner).anchorCertificate(certificateId, contentHash, templateType);

    const anchor = await registry.getAnchor(certificateId);
    expect(anchor.contentHash).to.equal(contentHash);
    expect(anchor.templateType).to.equal(templateType);
    expect(anchor.issuer).to.equal(owner.address);
    expect(anchor.timestamp).to.be.gt(0);
  });

  it("rejects duplicate certificate anchors", async function () {
    const { registry, owner } = await deployFixture();
    const certificateId = "CIV-DUPLICATE";
    const templateType = "donor";
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("duplicate-check"));

    await registry.connect(owner).anchorCertificate(certificateId, contentHash, templateType);

    await expect(
      registry.connect(owner).anchorCertificate(certificateId, contentHash, templateType)
    ).to.be.revertedWithCustomError(registry, "CertificateAlreadyAnchored");
  });
});
