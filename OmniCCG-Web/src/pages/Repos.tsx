import { Filter, FolderGit2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import RepoCard from "@/components/RepoCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Repo } from "@/types";
import { api } from "@/services/api";

const Repos = () => {
    const [userRepos, setUserRepos] = useState<Repo[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRepos = async () => {
            try {
                const data = await api.fetchUserRepos();
                setUserRepos(data);
            } catch (err) {
                console.error("Failed to load repos", err);
                setError("Unable to load repositories at this time.");
                setUserRepos([]);
            }
        };

        loadRepos();
    }, []);

    const navigate = useNavigate();

    const handleRun = (repo: Repo) => {
        navigate("/configure", { state: { repoUrl: repo.clone_url } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex justify-between">
                        <div className="flex gap-3 items-center">
                            <FolderGit2 className="w-10 h-10 text-primary" />
                            <h1 className="text-2xl font-bold">My Contributions</h1>
                        </div>
                        <div className="w-64 flex flex-col gap-2">
                            <div className="inline-flex gap-2">
                                <Filter className="w-5"/>
                                <Label htmlFor="repo-filter" className="text-sm font-semibold mb-2 block">
                                    Filter by:
                                </Label>
                            </div>
                            <Select defaultValue="Last Updated">
                                <SelectTrigger id="repo-filter">
                                    <SelectValue placeholder="Last Updated" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Last Updated">Last Updated</SelectItem>
                                    <SelectItem value="Last Analyzed">Last Analyzed</SelectItem>
                                    <SelectItem value="Name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="text-base mt-2 text-muted-foreground">
                        GitHub repositories you've contributed to.
                    </p>
                </header>
                <main className="flex flex-col gap-3 w-full">
                    {error ? (
                        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
                            {error}
                        </div>
                    ) : userRepos === null ? (
                        <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
                            Loading repositories...
                        </div>
                    ) : userRepos.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
                            No repositories found.
                        </div>
                    ) : (
                        userRepos.map((r) => <RepoCard key={r.id} repo={r} onRun={handleRun} />)
                    )}
                </main>
            </div>
        </div>
    );
};

export default Repos;