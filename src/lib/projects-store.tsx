import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialProjects, type Commitment, type Project, type RCA } from "./rca-data";

type Ctx = {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  updateCommitment: (projectId: string, rcaId: string, commitmentId: string, patch: Partial<Commitment>) => void;
  addExtractedRca: (projectId: string, rca: RCA) => void;
};

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const updateCommitment = useCallback(
    (projectId: string, rcaId: string, commitmentId: string, patch: Partial<Commitment>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id !== projectId
            ? p
            : {
                ...p,
                rcas: p.rcas.map((r) =>
                  r.id !== rcaId
                    ? r
                    : {
                        ...r,
                        commitments: r.commitments.map((c) =>
                          c.id === commitmentId ? { ...c, ...patch } : c,
                        ),
                      },
                ),
              },
        ),
      );
    },
    [],
  );

  const addExtractedRca = useCallback((projectId: string, rca: RCA) => {
    setProjects((prev) =>
      prev.map((p) => (p.id !== projectId ? p : { ...p, rcas: [...p.rcas, rca] })),
    );
  }, []);

  const value = useMemo<Ctx>(
    () => ({ projects, setProjects, updateCommitment, addExtractedRca }),
    [projects, updateCommitment, addExtractedRca],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
