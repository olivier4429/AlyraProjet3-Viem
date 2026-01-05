import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, type WorkflowFunction, workflowLabels, WORKFLOW_FUNCTIONS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting'
import { useEffect } from "react";
import { useOwner } from '../context/OwnerContext';  // Import du context
import { Button } from "@/components/ui/button"
import CustomMessageCard from "@/components/CustomMessageCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
export default function WorkflowManager() {

    const TITLE = "gestion du workflow";
    const {
        isOwner,
        isOwnerLoading,
        isConnected
    } = useOwner();



    // Si connecté mais PAS owner → message d'accès refusé
    if (!isOwner) {
        return (
            <CustomMessageCard title={TITLE}>
                ❌ Accès refusé : Vous n'êtes pas le propriétaire du contrat.
            </CustomMessageCard>
        );
    }

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



    const WORKFLOW_ACTIONS: Record<number, {
        label: string;
        fn: WorkflowFunction;
    }> = {
        0: {
            label: "Start proposals registration",
            fn: WORKFLOW_FUNCTIONS.START_PROPOSALS,
        },
        1: {
            label: "End proposals registration",
            fn: WORKFLOW_FUNCTIONS.END_PROPOSALS,
        },
        2: {
            label: "Start voting session",
            fn: WORKFLOW_FUNCTIONS.START_VOTING,
        },
        3: {
            label: "End voting session",
            fn: WORKFLOW_FUNCTIONS.END_VOTING,
        },
        4: {
            label: "Tally votes",
            fn: WORKFLOW_FUNCTIONS.TALLY,
        },
    };

    const action = workflowStatus !== undefined
        ? WORKFLOW_ACTIONS[Number(workflowStatus)]
        : undefined;



    // Si pas connecté ou en chargement → on affiche rien ou un message
    if (!isConnected) {
        return (
            <CustomMessageCard title={TITLE}>
                ⚠️ Connectez votre wallet pour accéder aux fonctions d'administration.
            </CustomMessageCard>
        );
    }

    if (isOwnerLoading) {
        return (
            <CustomMessageCard title={TITLE}>
                Vérification de vos droits d'administrateur...
            </CustomMessageCard>

        );
    }



    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Workflow management</CardTitle>
                <CardDescription>Faire avancer le workflow</CardDescription>
            </CardHeader>
            <CardContent>
                <p><strong>Current status :</strong>{" "}
                    <p>status ={workflowStatus} </p>
                    {workflowStatus !== undefined
                        ? workflowLabels[Number(workflowStatus)]
                        : "Loading..."}</p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                {!isLoading && action && (
                    <Button variant="default" className="w-full" onClick={() => advanceWorkflow(action.fn)}>
                        {action.label}
                    </Button>
                )}
                {!isLoading && !action && <p>Workflow completed</p>}
                {isLoading && <p style={{ color: 'blue' }}>Transaction en cours...</p>}
                {isError && <p style={{ color: 'red' }}>Erreur : {error?.message}</p>}
            </CardFooter>
        </Card>
    );
}
