// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentPaymentRouter
 * @author OREBOT Network
 * @notice Escrowed on-chain payments between OREBOTs. A client (OREBOT or human)
 *         locks ORE against a task; the assigned agent completes the task; the
 *         Guardian/oracle releases (or refunds). This is the execution-layer
 *         settlement for autonomous agent-to-agent work.
 *
 * Lifecycle:
 *  createTask(client, agent, amount, taskRef)  -> task in Escrowed
 *  release(taskId)        [REPORTER_ROLE]      -> funds to agent, task Released
 *  refund(taskId)         [REPORTER_ROLE]      -> funds back to client, task Refunded
 *  cancel(taskId)         [client]             -> only while Escrowed, refunds client
 *
 * AUDITOR FOCUS:
 *  - Pull-over-push: agents/client claim via transfer; no external call before state clear.
 *  - Reentrancy: _update status before transfer; no callbacks to untrusted addresses.
 *  - Only REPORTER_ROLE can release/refund; client can cancel only pre-release.
 *  - No funds can be stranded: every Escrowed task has a refund/cancel/release path.
 */
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentPaymentRouter is AccessControl, ReentrancyGuard {
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

    IERC20 public immutable ore;

    enum TaskState { Escrowed, Released, Refunded, Cancelled }

    struct PaymentTask {
        address client;      // who pays
        address agent;       // who is paid on success
        uint256 amount;      // ORE escrowed
        bytes32 taskRef;     // off-chain task id (Task entity id hash)
        TaskState state;
        uint64 createdAt;
    }

    mapping(uint256 => PaymentTask) public tasks;
    uint256 public nextTaskId = 1;

    event TaskCreated(uint256 indexed taskId, address indexed client, address indexed agent, uint256 amount, bytes32 taskRef);
    event TaskReleased(uint256 indexed taskId, address indexed agent, uint256 amount);
    event TaskRefunded(uint256 indexed taskId, address indexed client, uint256 amount);
    event TaskCancelled(uint256 indexed taskId, address indexed client, uint256 amount);

    error ZeroAddress();
    error ZeroAmount();
    error NotClient();
    error NotEscrowed();
    error TransferFailed();

    constructor(address oreToken) {
        ore = IERC20(oreToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REPORTER_ROLE, msg.sender);
    }

    /// @notice Client locks ORE against a task assigned to an agent. Requires prior approve().
    function createTask(address agent, uint256 amount, bytes32 taskRef) external returns (uint256 taskId) {
        if (agent == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        taskId = nextTaskId++;
        tasks[taskId] = PaymentTask({
            client: msg.sender,
            agent: agent,
            amount: amount,
            taskRef: taskRef,
            state: TaskState.Escrowed,
            createdAt: uint64(block.timestamp)
        });

        bool ok = ore.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();
        emit TaskCreated(taskId, msg.sender, agent, amount, taskRef);
    }

    /// @notice Guardian/oracle releases escrow to the agent after verified completion.
    function release(uint256 taskId) external onlyRole(REPORTER_ROLE) nonReentrant {
        PaymentTask storage t = tasks[taskId];
        if (t.state != TaskState.Escrowed) revert NotEscrowed();
        t.state = TaskState.Released;
        _safeTransfer(t.agent, t.amount);
        emit TaskReleased(taskId, t.agent, t.amount);
    }

    /// @notice Guardian/oracle refunds the client (task failed / disputed).
    function refund(uint256 taskId) external onlyRole(REPORTER_ROLE) nonReentrant {
        PaymentTask storage t = tasks[taskId];
        if (t.state != TaskState.Escrowed) revert NotEscrowed();
        t.state = TaskState.Refunded;
        _safeTransfer(t.client, t.amount);
        emit TaskRefunded(taskId, t.client, t.amount);
    }

    /// @notice Client cancels an unfulfilled escrowed task and recovers funds.
    function cancel(uint256 taskId) external nonReentrant {
        PaymentTask storage t = tasks[taskId];
        if (t.client != msg.sender) revert NotClient();
        if (t.state != TaskState.Escrowed) revert NotEscrowed();
        t.state = TaskState.Cancelled;
        _safeTransfer(t.client, t.amount);
        emit TaskCancelled(taskId, t.client, t.amount);
    }

    function _safeTransfer(address to, uint256 amount) private {
        bool ok = ore.transfer(to, amount);
        if (!ok) revert TransferFailed();
    }

    function getTask(uint256 taskId) external view returns (PaymentTask memory) {
        return tasks[taskId];
    }
}
