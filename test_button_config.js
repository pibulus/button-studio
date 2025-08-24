// Test script to verify PWA route works
const buttonConfig = {
  content: {
    label: "Test Button",
    emoji: "🎤",
    autoScale: true
  },
  size: {
    width: 200,
    height: 200
  },
  shape: {
    type: "circle",
    borderRadius: 50
  },
  appearance: {
    fill: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: {
      width: 4,
      color: "#000000"
    },
    shadow: {
      enabled: true,
      x: 4,
      y: 8,
      blur: 0,
      color: "#00000040"
    }
  }
};

// Encode as URL-safe base64
const json = JSON.stringify(buttonConfig);
const base64 = btoa(json);
const urlSafeId = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

console.log("Test URL: http://localhost:8000/b/" + urlSafeId);
