import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";

describe("anchor-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;

  const vaultState = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), provider.publicKey.toBytes()],
    program.programId
  )[0];

  const vault = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultState.toBytes()],
    program.programId
  )[0];

  console.log("vault: ", vault.toBase58());

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        vaultState,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature", tx);
    console.log("Vault info:", await provider.connection.getAccountInfo(vault));
  });

  it("Is deposited", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(3 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

      console.log("Your transaction signature: ", tx);
      console.log("VAult info: ", await provider.connection.getAccountInfo(vault));
      console.log("VAult balance: ", await provider.connection.getBalance(vault));
  })

  it("Is withdrawn", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(1* anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

      console.log("Your transaction signature: ", tx);
      console.log("Vault info : ", await provider.connection.getAccountInfo(vault));
      console.log("Vault balance: ", await provider.connection.getBalance(vault));
  })

  it('Is account close', async () => {
    const tx = await program.methods
      .closeAccount()
      .accountsPartial({
        vaultState,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

      console.log("Your transaction signature: ", tx);
      console.log("vault info: ", await provider.connection.getAccountInfo(vault));
      console.log("vault balnace: ", await provider.connection.getBalance(vault));
  })
});
