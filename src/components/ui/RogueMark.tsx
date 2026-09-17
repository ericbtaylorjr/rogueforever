import logo from '../../assets/icon-rogue.png';

export function RogueMark({ size = 30 }: { size?: number }) {
  return (
    <img
      src={logo}
      alt="The Comfy Wizard"
      width={size}
      height={size}
      className="shrink-0"
      style={{ width: size, height: size, objectFit: 'cover' }}
    />
  );
}
