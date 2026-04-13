import React from "react";
import { Series } from "remotion";
import { TitleCard } from "./scenes/TitleCard";
import { ScopeOverview } from "./scenes/ScopeOverview";
import { MechanicalWins } from "./scenes/MechanicalWins";
import { TransitionScene } from "./scenes/Transition";
import { ClassificationBreakdown } from "./scenes/ClassificationBreakdown";
import { BreakageDeepDive } from "./scenes/BreakageDeepDive";
import { IncompleteDeepDive } from "./scenes/IncompleteDeepDive";
import { MissOverview } from "./scenes/MissOverview";
import { PatternTable } from "./scenes/PatternTable";
import { PunchListOverview } from "./scenes/PunchListOverview";
import { ModalFix } from "./scenes/ModalFix";
import { EmptyStateFix } from "./scenes/EmptyStateFix";
import { FinalVerdict } from "./scenes/FinalVerdict";

export const MigrationScorecard: React.FC = () => {
  return (
    <Series>
      {/* Act 1 — The Promise */}
      <Series.Sequence durationInFrames={150}>
        <TitleCard />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <ScopeOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <MechanicalWins />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <TransitionScene />
      </Series.Sequence>

      {/* Act 2 — The Reality */}
      <Series.Sequence durationInFrames={900}>
        <ClassificationBreakdown />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1200}>
        <BreakageDeepDive />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1200}>
        <IncompleteDeepDive />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <MissOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <PatternTable />
      </Series.Sequence>

      {/* Act 3 — The Cleanup */}
      <Series.Sequence durationInFrames={600}>
        <PunchListOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={300}>
        <ModalFix />
      </Series.Sequence>
      <Series.Sequence durationInFrames={300}>
        <EmptyStateFix />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <FinalVerdict />
      </Series.Sequence>
    </Series>
  );
};
