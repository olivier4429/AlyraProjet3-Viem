import './global.css';
import Header from './components/Header'
import WorkflowManager from "./components/WorkflowManager"
import { Separator } from "@/components/ui/separator"
import Footer from './components/Footer';
function App() {

  return (
    <>
      <Header />
       <Separator className="my-4" />
      <WorkflowManager/>
       <Separator className="my-4" />
       <Footer/>
    </>
  )
}

export default App
