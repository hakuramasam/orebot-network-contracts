# Third-Party Notices

Everything below belongs to someone else. It is used here under its own license
and is not claimed as OREBOT Network property.

---

## Dependencies bundled or vendored

### OpenZeppelin Contracts
- **Component:** `lib/openzeppelin-contracts`, and every `@openzeppelin/contracts/*`
  import in `contracts/`
- **Copyright:** OpenZeppelin
- **License:** MIT
- **Source:** https://github.com/OpenZeppelin/openzeppelin-contracts
- **Used for:** ERC20, ERC20Burnable, ERC20Permit, ERC20Capped, AccessControl,
  ReentrancyGuard, SafeERC20, Pausable, and related primitives
- **Note:** the `lib/` directory is a git submodule pointer. The library is not
  re-licensed by this repository, and `LICENSE` does not apply to it.

### forge-std
- **Component:** `lib/forge-std` (test harness)
- **Copyright:** Foundry contributors
- **License:** MIT OR Apache-2.0
- **Source:** https://github.com/foundry-rs/forge-std

### Node and TypeScript dependencies
- **Component:** everything resolved under `node_modules/` from `package.json`
  and `pnpm-lock.yaml` across `apps/` and `packages/`
- **License:** per package; each retains its own `LICENSE` file in its
  distributed package
- **Note:** dependency licenses are not reproduced here. Run
  `pnpm licenses list` to generate the current inventory for a given lockfile.

---

## Tooling used but not redistributed

These produced parts of this repository or its audit outputs. No part of them is
included in the source tree.

| Tool | License | Role |
|---|---|---|
| Foundry (forge, cast, anvil, chisel) | MIT / Apache-2.0 | compilation, testing, chain reads |
| Slither | AGPL-2.0 | static analysis output |
| solc | GPL-3.0 | compiler |
| GitHub Actions runners | per GitHub terms | CI |

**Slither note:** Slither is AGPL-licensed. It is used as an external tool that
produces JSON output consumed for analysis. Its source is not combined with this
repository's code and is not redistributed with it.

---

## Protocol interfaces and referenced designs

Contract interfaces and design patterns that follow published protocol
specifications derive from those projects:

- **Aerodrome / Velodrome** (Base) — pool and gauge interfaces. The ORE/TREND
  pool referenced at `0x283392818596762C187E3A671f9cb77bA9848f37` is an
  Aerodrome deployment, not OREBOT code.
- **Uniswap** — nonfungible position manager interface conventions.
- **Orca** (Solana) — Splash pool interfaces, used for the Solana ORE pool.
- **Jupiter** (Solana) — routing and token list conventions.
- **Safe** — multisig used for custody; Safe is third-party infrastructure.

Where our code interoperates with these, our code is the interface caller. Their
protocols, deployed contracts, and marks remain theirs.

---

## Reference material in the agent's skill library

The OREBOT agent's audit methodology draws on MIT-licensed reference checklists
published by **ethskills** (https://ethskills.com). Those checklists inform how
we review code; the reports we produce are our own analysis, and the checklists
themselves are not reproduced as our work.

Skill content installed from third-party sources, including
`self-improving-agent` (ClawHub, by pskoett), retains its upstream license and
remains attributable to its author.

---

## Projects OREBOT Network has audited or screened

Tokens, contracts, and teams that have appeared in OREBOT audit outputs —
including OREToken-adjacent third-party tokens, YMOS (Yieldmos), and the
candidates in any screening list — **belong to their own teams**.

An audit report is commentary and analysis about a project. It creates no
ownership of that project's code, name, or assets, and it does not license us to
reuse their code in our products. Where a report quotes source, the quotation is
for identification and review purposes.

---

## Trademarks

"Base", "Base44", "Aerodrome", "Uniswap", "Orca", "Jupiter", "Solana", "Safe",
"OpenZeppelin", "Foundry", and "Slither" are the marks of their respective
owners. Their use here is nominative: naming the technology we integrate with.
No affiliation or endorsement is implied.

---

# Reporting an attribution problem

If you believe something in this repository is attributed incorrectly, or that
material of yours is used without proper credit, contact the maintainers through
the repository issue tracker. Correct attribution is treated as a bug and fixed
promptly.
