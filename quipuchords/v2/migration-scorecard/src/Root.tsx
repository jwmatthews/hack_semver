import { Composition } from "remotion";
import { MigrationScorecard } from "./MigrationScorecard";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MigrationScorecard"
      component={MigrationScorecard}
      durationInFrames={8100}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
