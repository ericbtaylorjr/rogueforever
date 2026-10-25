import { Shell } from './components/shell/Shell';
import { AllRoguesBanner, SpecZone } from './components/shell/SpecZone';
import { Buffs } from './components/sections/Buffs';
import { Changelog } from './components/sections/Changelog';
import { Credits } from './components/sections/Credits';
import { Consumables } from './components/sections/Consumables';
import { ExposeArmor } from './components/sections/ExposeArmor';
import { Footer } from './components/sections/Footer';
import { NewToRogue } from './components/sections/NewToRogue';
import { Gear } from './components/sections/Gear';
import { Macros } from './components/sections/Macros';
import { Overview } from './components/sections/Overview';
import { Poisons } from './components/sections/Poisons';
import { Professions } from './components/sections/Professions';
import { Pvp } from './components/sections/Pvp';
import { Races } from './components/sections/Races';
import { Raids } from './components/sections/Raids';
import { Rotation } from './components/sections/Rotation';
import { SpecBoard } from './components/sections/SpecBoard';
import { Stats } from './components/sections/Stats';
import { Talents } from './components/sections/Talents';
import { Tools } from './components/sections/Tools';
import { HandbookProvider } from './state/HandbookProvider';
import { ThemeProvider } from './state/ThemeProvider';
import { Divider } from './components/ui/Divider';
import { TooltipProvider } from './components/ui/Tooltip';

/**
 * One route, anchored sections, everything else is in-page state. Sections that
 * follow the active spec live in <SpecZone>; the rest apply to every Rogue.
 */
export default function App() {
  return (
    <ThemeProvider>
      <HandbookProvider>
        <TooltipProvider>
          <Shell>
            <Overview />
            <SpecBoard />
            <Divider />
            <SpecZone>
              <Talents />
              <Divider />
              <Stats />
              <Divider />
              <Gear />
              <Divider />
              <Rotation />
            </SpecZone>
            <Divider />
            <AllRoguesBanner />
            <Divider />
            <Races />
            <Divider />
            <Poisons />
            <Divider />
            <Consumables />
            <Divider />
            <Buffs />
            <Divider />
            <Professions />
            <Divider />
            <ExposeArmor />
            <Divider />
            <Raids />
            <Divider />
            <Pvp />
            <Divider />
            <Tools />
            <Divider />
            <Macros />
            <Divider />
            <NewToRogue />
            <Divider />
            <Changelog />
            <Divider />
            <Credits />
            <Footer />
          </Shell>
        </TooltipProvider>
      </HandbookProvider>
    </ThemeProvider>
  );
}
