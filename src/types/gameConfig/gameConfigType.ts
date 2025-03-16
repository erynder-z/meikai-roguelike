import { ScanlineStyles } from '../../renderer/scanlinesHandler';

export type GameConfigType = {
  SHOW_MENU: boolean;
  terminal: {
    dimensions: { width: number; height: number };
    scaling_factor: number;
    font: string;
  };
  show_scanlines: boolean;
  scanline_style: ScanlineStyles;
  show_images: boolean;
  message_display: 'left' | 'right';
  message_count: number;
  image_display: 'left' | 'right';
  seed: number;
  control_scheme: 'default' | 'wasd_keys' | 'vi_keys_QWERTY' | 'vi_keys_QWERTZ';
  player: {
    name: string;
    appearance: 'boyish' | 'girlish';
    color: string;
    avatar: string;
  };
  blood_intensity: number;
};
