'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { VOTING_ABI, VOTING_CONTRACT_ADDRESS } from '@/constants';

// Importez vos composants dès qu'ils sont prêts
// import AdminPanel from '@/components/AdminPanel';
// import VoterInterface from '@/components/VoterInterface';

export default function Home() {
  const { address, isConnected } = useAccount();
  
  // 1. Lecture du propriétaire du contrat
  const { data: ownerAddress } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'owner',
  });

  // 2. Lecture du statut actuel du workflow (Syntaxe Wagmi v2)
  const { data: status } = useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'workflowStatus',
    query: {
      refetchInterval: 3000, // Rafraîchit toutes les 3 secondes pour l'interactivité
    }
  });

  // Sécurité TypeScript : on s'assure que status est traité comme un nombre
  const currentStatus = status !== undefined ? Number(status) : undefined;
  
  // Comparaison propre des adresses
  const isAdmin = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      {/* Header avec RainbowKit */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold italic tracking-tighter">VOTING DAPP</h1>
        <ConnectButton showBalance={false} chainStatus="name" />
      </header>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center mt-32 space-y-4">
          <h2 className="text-2xl font-semibold">Bienvenue sur la plateforme de vote</h2>
          <p className="text-gray-500">Veuillez connecter votre wallet pour accéder aux fonctionnalités.</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Indicateur de statut (Stepper) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xs font-bold uppercase text-indigo-500 tracking-wider mb-2">Statut actuel du contrat</h2>
            <div className="text-2xl font-black text-gray-800">
              {getStatusLabel(currentStatus)}
            </div>
          </section>

          {/* Zone Administrateur - Visible uniquement par l'owner */}
          {isAdmin && (
            <section className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-amber-200 rounded-full text-amber-700 font-bold text-xs uppercase">Admin</span>
                <h2 className="text-xl font-bold text-amber-900">Tableau de bord de contrôle</h2>
              </div>
              <p className="mb-6 text-sm text-amber-800/80 italic text-pretty">
                En tant qu'administrateur, vous pouvez gérer la liste blanche et faire progresser les étapes du vote.
              </p>
              {/* <AdminPanel status={currentStatus} /> */}
              <div className="bg-amber-100/50 border-dashed border-2 border-amber-300 p-8 rounded-lg text-center text-amber-600">
                Composant AdminPanel à insérer ici
              </div>
            </section>
          )}

          {/* Zone Électeur / Public */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Interface de Participation</h2>
            {/* <VoterInterface status={currentStatus} userAddress={address} /> */}
            <div className="bg-gray-50 border-dashed border-2 border-gray-200 p-12 rounded-lg text-center text-gray-400 font-medium">
               Interface dynamique pour les propositions et le vote
            </div>
          </section>

        </div>
      )}
    </main>
  );
}

// Fonction utilitaire avec gestion des types
function getStatusLabel(status: number | undefined) {
  const labels = [
    "📌 Enregistrement des électeurs",
    "📝 Session de propositions ouverte",
    "⌛ Session de propositions terminée",
    "🗳️ Session de vote ouverte",
    "🔒 Session de vote terminée",
    "🏆 Résultats proclamés"
  ];
  
  if (status === undefined) return "Connexion au contrat...";
  return labels[status] || "État inconnu";
}