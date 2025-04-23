/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/headlined.json`.
 */
export type Headlined = {
  address: "9YhZtfHPa9YY13AXr7PhNV1YnWPkqhvd6g4NRTfNNcND";
  metadata: {
    name: "headlined";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createCollection";
      discriminator: [156, 251, 92, 54, 233, 2, 16, 82];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "collectionMint";
          writable: true;
        },
        {
          name: "collectionMetadata";
          writable: true;
        },
        {
          name: "collectionMasterEdition";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "tokenMetadataProgram";
          address: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "title";
          type: "string";
        },
        {
          name: "symbol";
          type: "string";
        },
        {
          name: "uri";
          type: "string";
        },
      ];
    },
    {
      name: "mint";
      discriminator: [51, 57, 225, 47, 182, 146, 137, 166];
      accounts: [
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "mint";
          writable: true;
        },
        {
          name: "metadata";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
        {
          name: "tokenMetadataProgram";
        },
        {
          name: "masterEdition";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "collectionMint";
        },
        {
          name: "collectionMetadata";
          writable: true;
        },
        {
          name: "collectionMasterEdition";
          writable: true;
        },
      ];
      args: [
        {
          name: "metadataTitle";
          type: "string";
        },
        {
          name: "metadataSymbol";
          type: "string";
        },
        {
          name: "metadataUri";
          type: "string";
        },
      ];
    },
  ];
};
