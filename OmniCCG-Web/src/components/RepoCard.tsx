import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Repo } from "@/types";

const formatUpdatedAt = (dateString: string): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return "today";
  }

  if (date >= startOfYesterday && date < startOfToday) {
    return "yesterday";
  }

  return date.toLocaleDateString();
};

const RepoCard = ({
  repo,
  onRun,
  onHistory,
}: {
  repo: Repo;
  onRun: (r: Repo) => void;
  onHistory?: (r: Repo) => void;
}) => {
  return (
    <div className="flex justify-between bg-card border border-border rounded-xl p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-2 w-full md:w-1/2">
        <div className="inline-flex gap-5 items-center w-full">
          <h2 className="text-xl font-medium">{repo.name}</h2>
          <Settings />
        </div>

        <div className="w-full break-words whitespace-normal max-w-full text-pretty">
          {repo.description}
        </div>

        <span className="inline-flex gap-2 items-center text-sm">
          <span>Last Updated: {formatUpdatedAt(repo.updated_at)}</span>
          <span className="text-muted-foreground"> | </span>
          <span>Main Language: {repo.language ?? "-"}</span>
          <span className="text-muted-foreground"> | </span>
          <span>Last Analysis: {repo.lastAnalysis ?? "-"}</span>
        </span>
      </div>

      <div className="flex flex-col gap-4 justify-center">
        <Button onClick={() => onRun(repo)}>Run Extraction</Button>
        <Button onClick={() => onHistory?.(repo)}>Genealogy History</Button>
      </div>
    </div>
  );
};

export default RepoCard;
