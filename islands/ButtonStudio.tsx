// ===================================================================
// BUTTON STUDIO - MAIN EXPORT
// This file now re-exports the refactored ButtonStudio component
// The actual implementation has been split into smaller modules:
// - ButtonStudioCore.tsx: Main component logic
// - ButtonStudioState.tsx: Signal state management  
// - ColorModeManager.tsx: Color mode system
// ===================================================================

import ButtonStudioCore from "./studio/ButtonStudioCore.tsx";

// Re-export the refactored ButtonStudio component
export default ButtonStudioCore;

// Also export the state and color modules for external use if needed
export * from "./studio/ButtonStudioState.tsx";
export * from "./studio/ColorModeManager.tsx";