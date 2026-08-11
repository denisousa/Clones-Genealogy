import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, GitBranch, Github } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { genericExamples, preliminaryExamples } from "@/lib/examplesData";
import { formatTime } from "@/lib/utils";
import { useState } from "react";
import { DiGithubBadge } from "react-icons/di"
import { api } from "@/services/api";

const Home = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await api.login();
    } catch (error) {
      console.error("Failed to login: ", error);
      setError(error as string);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        {/* (Examples accordion was previously top-right) - replaced by central toggle button below */}
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OmniCCG
            </h1>
          </div>
          <h2 className="text-2xl text-muted-foreground font-medium">
            Code Clone Genealogy Viewer
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Visualize and analyze the genealogy of code clones across your
            repository's history. <br /> OmniCCG is a genealogy extractor that is agnostic to clone detectors.
          </p>
        </header>

        {/* Main Card */}
        <div className="max-w-3xl flex flex-col items-center mx-auto">
          <div className="bg-card border border-border flex flex-col items-center rounded-2xl p-8 w-1/2 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]">
            <h3 className="text-xl font-bold mb-6 mt-3 flex items-center justify-center gap-2">
              Sign Into OmniCCG
            </h3>
            <p className="text-muted-foreground text-center mb-5">
              Start analyzing code clone genealogies in your projects.
            </p>
            <Button className="w-fit" onClick={handleLogin}>
              <DiGithubBadge size={32}/>
              Sign In With GitHub
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-semibold mb-1">Clone Detection</h4>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms to detect code clones
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold mb-1">Visual Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Interactive graphs and detailed statistics
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⏱️</span>
              </div>
              <h4 className="font-semibold mb-1">Evolution Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Follow code clone Genealogy through time
              </p>
            </div>
          </div>

          {/* Generic Examples button that opens a modal with the accordion */}
          <div className="flex justify-center gap-6 mt-8">
            {/* Generic Examples (black text) */}
            <Dialog>
              <DialogTrigger asChild>
                <a className="text-base text-black underline cursor-pointer font-medium">
                  Generic Examples
                </a>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle className="text-2xl">Generic Examples</DialogTitle>
                <DialogDescription className="text-base">
                  Examples of git repositories and configurations you can use
                </DialogDescription>

                <div className="mt-4 max-h-[60vh] overflow-auto space-y-4 text-base">
                  {genericExamples.map((group, gi) => (
                    <div key={gi} className="space-y-3">
                      {group.title && (
                        <h4 className="font-semibold text-lg mb-2">
                          {group.title}
                        </h4>
                      )}

                      {group.items.map((it, i) => (
                        <div key={i} className="p-3 border rounded-md bg-card">
                          <div className="font-semibold text-lg">
                            {it.name}
                          </div>

                          {it.git && (
                            <div className="text-sm text-muted-foreground mt-1">
                              URL:{" "}
                              <span className="font-mono text-sm">
                                {it.git}
                              </span>
                            </div>
                          )}

                          {typeof it.from_lasy_days !== "undefined" && (
                            <div className="text-sm text-muted-foreground mt-1">
                              From last days: {it.from_lasy_days}
                            </div>
                          )}

                          {it.from_specific_commit && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Specific commit:{" "}
                              <span className="font-mono text-xs">
                                {it.from_specific_commit}
                              </span>
                            </div>
                          )}

                          {it.merge_commits && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Merge: true
                            </div>
                          )}

                          {typeof it.fixed_leaps !== "undefined" && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Fixed leaps: {it.fixed_leaps}
                            </div>
                          )}

                          {/* NOVO: Clone Detector */}
                          {it.clone_detector && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Clone Detector: {it.clone_detector}
                            </div>
                          )}

                          {it.time && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Time: {it.time}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Preliminary Evaluation */}
            <Dialog>
              <DialogTrigger asChild>
                <a className="text-base text-black underline cursor-pointer font-medium">
                  Preliminary Evaluation
                </a>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle className="text-2xl">
                  Preliminary Evaluation
                </DialogTitle>
                <DialogDescription className="text-base">
                  Git repositories and configurations used in preliminary
                  evaluation.
                </DialogDescription>
                <div className="mt-4 max-h-[60vh] overflow-auto space-y-4 text-base">
                  {preliminaryExamples.map((group, gi) => (
                    <div key={gi}>
                      {group.items.map((it, i) => (
                        <div
                          key={i}
                          className="p-3 border rounded-md bg-card"
                        >
                          <div className="font-semibold text-lg">
                            {it.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            URL:{" "}
                            <span className="font-mono text-sm">
                              {it.git}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Start Commit:{" "}
                            {it.start_commit ??
                              (it.from_first_commit ? "first" : "specific")}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Fixed Leaps: {String(it.fixed_leaps ?? "-")}
                          </div>

                          {/* NOVO: Clone Detector */}
                          {it.clone_detector && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Clone Detector: {it.clone_detector}
                            </div>
                          )}

                          <div className="text-sm text-muted-foreground mt-1">
                            Time: {it.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
                
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
