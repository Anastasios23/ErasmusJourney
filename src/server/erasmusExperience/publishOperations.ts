import type { ExperienceRecord } from "./helpers";
import {
  refreshPublicDestinationReadModelIfNeeded,
  triggerStatsRefresh,
} from "./persistence";

export async function runSubmissionPublishSideEffects(
  updatedExperience: ExperienceRecord,
  onStatsRefreshError?: (
    error: unknown,
    context: { experienceId: string },
  ) => void,
): Promise<void> {
  await refreshPublicDestinationReadModelIfNeeded({
    id: updatedExperience.id,
    status: updatedExperience.status,
    isComplete: updatedExperience.isComplete,
    hostCity: updatedExperience.hostCity,
    hostCountry: updatedExperience.hostCountry,
  });

  triggerStatsRefresh(
    {
      id: updatedExperience.id,
      hostCity: updatedExperience.hostCity,
      hostCountry: updatedExperience.hostCountry,
    },
    onStatsRefreshError,
  );
}
