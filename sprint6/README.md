# OREBOT Sprint 6 — Multi-Agent Runtime

## Backend Function: agentRuntime

The core of OREBOT Network — a multi-agent runtime that coordinates 10 specialist AI agents.

### Modes
1. **Direct Agent Mode** — POST { user, task, agent: "developer" } → routes to specific agent
2. **Commander Delegation Mode** — POST { user, task, agent: "commander" } → Commander analyzes task, recommends best agent, auto-executes specialist, returns combined result

### Agent Roster (10 agents)
| Agent | Role | Credits | Default Model |
|-------|------|---------|---------------|
| Commander | Coordinator | 5 | gpt-oss-20b:free |
| Developer | Code Generation | 10 | north-mini-code:free |
| Auditor | Security Review | 15 | north-mini-code:free |
| Researcher | Research & Analysis | 20 | nemotron-super:free |
| Trader | Trading Analysis | 15 | nemotron-super:free |
| Creator | Creative Generation | 20 | gemma-4-31b:free |
| Designer | UI/UX Design | 10 | gemma-4-31b:free |
| Treasury | Financial Management | 10 | nemotron-super:free |
| Guardian | Security & Monitoring | 10 | gpt-oss-20b:free |
| Learning | Optimization | 5 | gpt-oss-20b:free |

### Commander Delegation Flow
```
User Task → Commander analyzes → JSON plan { assignedAgent, subtasks, estimatedCredits }
         → Auto-executes specialist agent → Returns combined result
         → Bills credits on-chain (commander + specialist)
```

### Tests (2026-07-28)
1. **Developer** (10 credits): Wrote complete Solidity staking contract with stake/unstake/claimRewards
2. **Commander → Trader** (20 credits): Commander analyzed trading task, delegated to Trader, got detailed market analysis with risk assessment

### Credit Billing
- Post-billing: credits deducted after AI response succeeds
- On-chain receipt with Basescan TX link
- Commander + specialist costs are combined in a single on-chain transaction

### Architecture
- Each agent has: name, role, system prompt, credit cost, preferred model, max tokens, temperature
- Auto-fallback to free models (gpt-oss-20b:free) on 402/404
- Credit balance check before execution (rejects if insufficient)
- OpenRouter API for all AI calls
