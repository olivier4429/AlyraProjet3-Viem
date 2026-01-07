import { createContext, useContext } from "react";
import { type WorkflowStatus } from "../constants"; // ton enum

type WorkflowContextType = {
    status?: WorkflowStatus;
    refetch: () => void;
};

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const useWorkflow = () => {
    const ctx = useContext(WorkflowContext);
    if (!ctx) throw new Error("useWorkflow must be inside WorkflowProvider");
    return ctx;
};

export default WorkflowContext;