import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem"; // Utilitaire de viem pour valider l'adresse
import { useOwner } from '../contexts/OwnerContext';  // Import du context
import { CONTRACT_ADDRESS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react"; // Icônes

import CustomMessageCard from "@/components/CustomMessageCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
export default function AddVoter() {

    const TITLE = "Enregistrement des voteurs";
    const {
        isOwner,
        isOwnerLoading,
        isConnected
    } = useOwner();
    
    const [address, setAddress] = useState("");

    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });
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


    const handleAddVoter = () => {
        if (!isAddress(address)) {
            alert("Veuillez saisir une adresse Ethereum valide.");
            return;
        }

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "addVoter",
            args: [address],
        });
    };


    // Si connecté mais PAS owner → message d'accès refusé
    if (!isOwner) {
        return (
            <CustomMessageCard title={TITLE}>
                ❌ Accès refusé : Vous n'êtes pas le propriétaire du contrat.
            </CustomMessageCard>
        );
    }

    const isLoading = isPending || isConfirming;

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Enregistrer un électeur
                </CardTitle>
                <CardDescription>
                    Ajoutez une adresse à la liste blanche (Whitelist).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="0x..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={isLoading}
                            className={!isAddress(address) && address !== "" ? "border-red-500" : ""}
                        />
                        {address !== "" && !isAddress(address) && (
                            <p className="text-xs text-red-500">Adresse invalide</p>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
                <Button
                    className="w-full"
                    onClick={handleAddVoter}
                    disabled={isLoading || !isAddress(address)}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        "Ajouter l'adresse"
                    )}
                </Button>

                {isSuccess && (
                    <p className="text-sm text-green-600 font-medium">
                        L'adresse a été ajoutée avec succès !
                    </p>
                )}
                {isError && <p style={{ color: 'red' }}>Erreur : {error?.message}</p>}
            </CardFooter>
        </Card>
    );
}