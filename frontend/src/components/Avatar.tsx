interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'small' | 'medium' | 'large' | 'hero';
}

export default function Avatar({ name, src, size = 'medium' }: AvatarProps) {
  const initial = name.trim().charAt(0) || 'A';
  return (
    <span className={`avatar avatar-${size}`} aria-label={`تصویر ${name}`}>
      {src ? <img src={src} alt="" /> : initial}
    </span>
  );
}
