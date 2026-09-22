// src/hooks/useHaptic.js
import { hapticLight, hapticMedium, hapticHeavy, hapticSuccess, hapticError } from '../services/NativePush';

export default function useHaptic() {
  return {
    light:   hapticLight,
    medium:  hapticMedium,
    heavy:   hapticHeavy,
    success: hapticSuccess,
    error:   hapticError,
  };
}