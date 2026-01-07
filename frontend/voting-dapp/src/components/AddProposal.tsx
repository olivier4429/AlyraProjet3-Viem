import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting';
import { useOwner } from '../contexts/OwnerContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomMessageCard from "@/components/CustomMessageCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import useStatusVoter from "@/hooks/useStatusVoter";
import { type Voter} from "@/types"


export default function AddProposal() {
    const TITLE = "Enregistrer une proposition";
    const [description, setDescription] = useState("");

    const { isConnected } = useOwner();
    const { address } = useAccount();
    const  voterInfo  =useStatusVoter();
 

    /* ===== WRITE CONTRACT ===== */
    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    const { isSuccess: isConfirmed, isLoading: isMining } = useWaitForTransactionReceipt({
        hash,
    });

    const isLoading = isPending || isMining;

    /* ===== Reset form after success ===== */
    useEffect(() => {
        if (isConfirmed) {
            setDescription("");
        }
    }, [isConfirmed]);

    /* ===== SUBMIT PROPOSAL ===== */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            return;
        }

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "addProposal",
            args: [description],
        });
    };

    /* ===== CHECKS ===== */
    if (!isConnected) {
        return (
            <CustomMessageCard title={TITLE}>
                ⚠️ Connectez votre wallet pour soumettre une proposition.
            </CustomMessageCard>
        );
    }

    const isVoter = voterInfo && (voterInfo as Voter).isRegistered;
    //const isProposalPhase = workflowStatus === 1; // ProposalsRegistrationStarted

    if (!isVoter) {
        return (
            <CustomMessageCard title={TITLE}>
                ❌ Vous n'êtes pas enregistré comme votant.
            </CustomMessageCard>
        );
    }

 /*   if (!isProposalPhase) {
        return (
            <CustomMessageCard title={TITLE}>
                ⏸️ La phase d'enregistrement des propositions n'est pas active.
            </CustomMessageCard>
        );
    }
*/
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Enregistrer une proposition</CardTitle>
                <CardDescription>Soumettez votre proposition au vote</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Input
                            type="text"
                            placeholder="Description de votre proposition"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            maxLength={200}
                        />
                        {description.trim() && (
                            <p className="text-sm text-gray-500">
                                {description.length}/200 caractères
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                        disabled={isLoading || !description.trim()}
                    >
                        {isLoading ? "Transaction en cours..." : "Soumettre la proposition"}
                    </Button>
                    {isConfirmed && (
                        <p className="text-green-600 text-sm">
                            ✓ Proposition enregistrée avec succès !
                        </p>
                    )}
                    {isError && (
                        <p className="text-red-600 text-sm">
                            Erreur : {error?.message}
                        </p>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}