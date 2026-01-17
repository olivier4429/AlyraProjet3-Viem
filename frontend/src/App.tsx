import './global.css';
import Header from './components/layout/Header';
import WorkflowManager from "./components/admin/WorkflowManager";
import AddVoter from "./components/admin/AddVoter";
import AddProposal from './components/voting/AddProposal';
import ProposalsList from './components/voting/ProposalsList';
import VoteResults from './components/voting/VoteResults';
import { useApp } from './contexts/AppContext';
import Footer from './components/layout/Footer';
import RegisteredVotersList from './components/voting/RegisteredVotersList';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Users, FileText, Vote, BarChart3, Settings } from 'lucide-react';

function App() {
  const { workflowStatus, isOwner, isVoter, isWorkflowError, workflowError } = useApp();

  // Déterminer quelle section afficher en fonction du workflow
  const renderMainContent = () => {
    switch (workflowStatus) {
      case 0: // RegisteringVoters
        return (
          <div className="space-y-6">
            {isOwner && (
              <Card className="border-blue-500 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Users className="h-6 w-6" />
                    Phase 1 : Enregistrement des votants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    En tant qu'administrateur, ajoutez les adresses autorisées à voter.
                  </p>
                  <AddVoter />
                </CardContent>
              </Card>
            )}
            {!isOwner && isVoter && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Vous êtes enregistré !</h3>
                  <p className="text-gray-600">
                    En attente du début de l'enregistrement des propositions...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1: // ProposalsRegistrationStarted
        return (
          <div className="space-y-6">
            <Card className="border-green-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <FileText className="h-6 w-6" />
                  Phase 2 : Soumission des propositions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Soumettez vos propositions de vote. Tous les votants enregistrés peuvent proposer.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AddProposal />
                  <ProposalsList />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // ProposalsRegistrationEnded
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Propositions enregistrées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  L'enregistrement des propositions est terminé. En attente du début de la session de vote...
                </p>
                <ProposalsList />
              </CardContent>
            </Card>
          </div>
        );

      case 3: // VotingSessionStarted
        return (
          <div className="space-y-6">
            <Card className="border-purple-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Vote className="h-6 w-6" />
                  Phase 3 : Session de vote en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Votez pour votre proposition préférée. Vous ne pouvez voter qu'une seule fois !
                </p>
                <ProposalsList />
              </CardContent>
            </Card>
          </div>
        );

      case 4: // VotingSessionEnded
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-6 w-6" />
                  Vote terminé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  La session de vote est terminée. En attente du décompte des votes...
                </p>
                <ProposalsList />
              </CardContent>
            </Card>
          </div>
        );

      case 5: // VotesTallied
        return (
          <div className="space-y-6">
            <Card className="border-yellow-500 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <BarChart3 className="h-6 w-6" />
                  Phase finale : Résultats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Le vote est terminé et les résultats ont été comptabilisés !
                </p>
                <VoteResults />
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">Status du contrat inconnu {isWorkflowError}, {workflowError}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Barre de progression du workflow **************************************************/}
          <Card className="bg-card shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Progression du vote</h2>
                <span className="text-sm text-gray-500">
                  Étape {workflowStatus !== undefined ? workflowStatus + 1 : 0} / 6
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full transition-all ${workflowStatus !== undefined && step <= workflowStatus
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                      }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Votants</span>
                <span>Propositions</span>
                <span>Vote</span>
                <span>Résultats</span>
              </div>
            </CardContent>
          </Card>
          {/* Fin Barre de progression du workflow **************************************************/}

          <Card className="bg-card shadow-sm"></Card>
          {/* Contenu principal basé sur la phase */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Colonne principale (3/4) */}
            <div className="lg:col-span-3">
              {renderMainContent()}
              <RegisteredVotersList/>
            </div>

            {/* Sidebar (1/4) - Toujours visible pour l'admin */}
            <div className="space-y-6">
              {isOwner && (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Settings className="h-5 w-5" />
                      Administration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkflowManager />
                  </CardContent>
                </Card>
              )}

              {/* Info card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isVoter ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>{isVoter ? 'Votant enregistré' : 'Non enregistré'}</span>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Administrateur</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
