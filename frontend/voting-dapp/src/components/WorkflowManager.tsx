import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, type WorkflowFunction, workflowLabels, WORKFLOW_FUNCTIONS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting'
import { useMemo } from "react";
import { useEffect } from "react";


export default function WorkflowManager() {
    //  const [pendingAction, setPendingAction] = useState<WorkflowFunction | null>(null);
    //  const [localWorkflow, setLocalWorkflow] = useState(0);
    /* ===== READ WORKFLOW STATUS ===== */
    const { data: workflowStatus, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "workflowStatus",
    });

    /* ===== WRITE CONTRACT ===== */
    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    const { isSuccess: isConfirmed, isLoading: isMining } = useWaitForTransactionReceipt({
        hash,
    });

    const isLoading = isPending || isMining;

    /* ===== Rafraîchir après confirmation ===== */
    useEffect(() => {
        if (isConfirmed) {
            refetch();
        }
    }, [isConfirmed, refetch]);



    /* ===== ACTIONS ===== */
    const advanceWorkflow = (functionName: WorkflowFunction) => {

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName,
        });
    };

    /* ===== BUTTON TO SHOW ===== */
    const getActionButton = () => {
        switch (Number(workflowStatus)) {
            case 0:
                return (
                    <button onClick={() => advanceWorkflow(WORKFLOW_FUNCTIONS.START_PROPOSALS)}>
                        Start proposals registration
                    </button>
                );
            case 1:
                return (
                    <button onClick={() => advanceWorkflow(WORKFLOW_FUNCTIONS.END_PROPOSALS)}>
                        End proposals registration
                    </button>
                );
            case 2:
                return (
                    <button onClick={() => advanceWorkflow(WORKFLOW_FUNCTIONS.START_VOTING)}>
                        Start voting session
                    </button>
                );
            case 3:
                return (
                    <button onClick={() => advanceWorkflow(WORKFLOW_FUNCTIONS.END_VOTING)}>
                        End voting session
                    </button>
                );
            case 4:
                return (
                    <button onClick={() => advanceWorkflow(WORKFLOW_FUNCTIONS.TALLY)}>
                        Tally votes
                    </button>
                );
            default:
                return <p>Workflow completed</p>;
        }
    };



    return (
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
            <h2>Workflow management</h2>

            <p>
                <strong>Current status :</strong>{" "}
                <p>status ={workflowStatus} </p>
                {workflowStatus !== undefined
                    ? workflowLabels[Number(workflowStatus)]
                    : "Loading..."}
            </p>
            {isLoading && <p>Transaction pending...</p>}

            {!isLoading && getActionButton()}<br />
            {isError ? `❌ ${error?.message}` : ''}<br />
        </div>
    );
}
