import { Shell } from './components/shell/Shell';
import { SpecBar } from './components/shell/SpecBar';
import { Buffs } from './components/sections/Buffs';
import { Changelog } from './components/sections/Changelog';
import { Consumables } from './components/sections/Consumables';
import { ExposeArmor } from './components/sections/ExposeArmor';
import { Faq } from './components/sections/Faq';
import { Footer } from './components/sections/Footer';
import { ForeverWatch } from './components/sections/ForeverWatch';
import { Gear } from './components/sections/Gear';
import { Leveling } from './components/sections/Leveling';
import { Overview } from './components/sections/Overview';
import { Poisons } from './components/sections/Poisons';
import { Raids } from './components/sections/Raids';
import { Rotation } from './components/sections/Rotation';
import { SpecBoard } from './components/sections/SpecBoard';
import { Talents } from './components/sections/Talents';
import { Tools } from './components/sections/Tools';
import { CompendiumProvider } from './state/CompendiumProvider';
import { Divider } from './components/ui/Divider';
import { TooltipProvider } from './components/ui/Tooltip';

/** One route, 15 anchored sections, everything else is in-page state. */
export default function App() {
  return (
    <CompendiumProvider>
      <TooltipProvider>
        <Shell>
          <Overview />
          <SpecBar />
          <SpecBoard />
          <Divider />
          <ForeverWatch />
          <Divider />
          <Talents />
          <Divider />
          <Poisons />
          <Divider />
          <Rotation />
          <Divider />
          <Gear />
          <Divider />
          <Consumables />
          <Divider />
          <Buffs />
          <Divider />
          <ExposeArmor />
          <Divider />
          <Raids />
          <Divider />
          <Tools />
          <Divider />
          <Leveling />
          <Divider />
          <Faq />
          <Divider />
          <Changelog />
          <Footer />
        </Shell>
      </TooltipProvider>
    </CompendiumProvider>
  );
}
