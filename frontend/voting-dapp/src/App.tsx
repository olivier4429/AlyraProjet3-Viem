import './global.css';
import Header from './components/layout/Header';
import WorkflowManager from "./components/admin/WorkflowManager";
import AddVoter from "./components/admin/AddVoter";
import AddProposal from './components/voting/AddProposal';
import ProposalsList from './components/voting/ProposalsList';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Section Admin - Enregistrement des voteurs */}
          <div className="w-full">
            <AddVoter />
          </div>
          
          {/* Section Voter - Ajout de propositions */}
          <div className="w-full">
            <AddProposal />
          </div>
          
          {/* Section Propositions */}
          <div className="w-full">
            <ProposalsList />
          </div>
          
          {/* Section Admin - Gestion du workflow */}
          <div className="w-full">
            <WorkflowManager />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;