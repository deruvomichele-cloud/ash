const fs = require("fs");
const https = require("https");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config();

const PINATA_API_HOST = "api.pinata.cloud";
const imagePath = path.join(__dirname, "..", "assets", "ash-coin.png");
const metadataPath = path.join(__dirname, "..", "metadata", "ashes-token.json");

function requestPinata({ requestPath, method, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: PINATA_API_HOST,
        path: requestPath,
        method,
        headers,
      },
      (res) => {
        let data = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            reject(new Error(`Pinata returned non-JSON response: ${data}`));
            return;
          }

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
              new Error(
                `Pinata request failed (${res.statusCode}): ${JSON.stringify(parsed)}`
              )
            );
            return;
          }

          resolve(parsed);
        });
      }
    );

    req.on("error", reject);

    if (body && typeof body.pipe === "function") {
      body.pipe(req);
    } else {
      req.end(body);
    }
  });
}

async function pinFile(jwt) {
  const form = new FormData();

  form.append("file", fs.createReadStream(imagePath), {
    filepath: "ash-coin.png",
    contentType: "image/png",
  });
  form.append(
    "pinataMetadata",
    JSON.stringify({
      name: "ASHES coin image",
      keyvalues: {
        token: "ASH",
        network: "base-sepolia",
      },
    })
  );

  return requestPinata({
    requestPath: "/pinning/pinFileToIPFS",
    method: "POST",
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${jwt}`,
    },
    body: form,
  });
}

async function pinJson(jwt, metadata) {
  return requestPinata({
    requestPath: "/pinning/pinJSONToIPFS",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: "ASHES token metadata",
        keyvalues: {
          token: "ASH",
          network: "base-sepolia",
        },
      },
      pinataContent: metadata,
    }),
  });
}

async function main() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt || jwt === "paste_your_pinata_jwt_here") {
    throw new Error("Set PINATA_JWT in .env before uploading.");
  }

  const imageResult = await pinFile(jwt);
  const imageUri = `ipfs://${imageResult.IpfsHash}`;

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  metadata.image = imageUri;
  fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

  const metadataResult = await pinJson(jwt, metadata);

  console.log(`Image IPFS URI: ${imageUri}`);
  console.log(`Image gateway URL: https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`);
  console.log(`Metadata IPFS URI: ipfs://${metadataResult.IpfsHash}`);
  console.log(
    `Metadata gateway URL: https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
