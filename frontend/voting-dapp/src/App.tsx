import './global.css';
import Header from './components/Header'
import WorkflowManager from "./components/WorkflowManager"
import AddVoter from "./components/AddVoter"
/*import AddProposal from './components/AddProposal';
import ProposalsList from './components/ProposalsList'*/
import Footer from './components/Footer';
function App() {

  return (
    <div className="flex flex-col ">
      <Header />
      <main className="flex flex-1  items-start">
        {/* Zone de gauche (3/4 de la page) */}
        <div className="w-1/4 p-4">
          <AddVoter />
        </div>
        <div className="w-1/4 p-4">
          {/*<AddProposal/>*/}
        </div>
        <div className="w-1/4 p-4">
          {/*<ProposalsList/>*/}
        </div>
        {/* WorkflowManager (1/4 de la page) */}
        <div className="w-1/4  p-4">
          <WorkflowManager />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
