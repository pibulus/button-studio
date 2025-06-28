import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { signal } from '@preact/signals';
import VoiceButton from "../components/VoiceButton.tsx";
import ToastContainer, { toast } from "../components/Toast.tsx";
import EmojiPicker from "../components/EmojiPicker.tsx";
// Simple live design state - just the essentials!
// Complete button configuration state
const buttonConfig = signal({
  content: {
    text: '🎤',
    autoScale: true
  },
  size: {
    width: 120,
    height: 120,
    maintainRatio: true
  },
  shape: {
    type: 'square',
    borderRadius: 12
  },
  appearance: {
    fill: {
      type: 'gradient',
      solid: '#FF8FA3',
      gradient: {
        type: 'linear',
        colors: [
          '#FF8FA3',
          '#FFB8CC'
        ],
        direction: 45
      }
    },
    border: {
      width: 4,
      color: '#4A4A4A',
      style: 'solid'
    },
    shadow: {
      type: 'glow',
      color: '#FF6B9D',
      blur: 20,
      spread: 0,
      x: 0,
      y: 0
    }
  }
});
const showAdvanced = signal(false) // progressive disclosure
;
// Color-rich randomization presets with millions of combinations
const generateRandomColor = ()=>{
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 40) // 60-100%
  ;
  const lightness = 45 + Math.floor(Math.random() * 20) // 45-65%
  ;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
const generateRandomGradient = ()=>({
    type: Math.random() > 0.7 ? 'radial' : 'linear',
    colors: [
      generateRandomColor(),
      generateRandomColor()
    ],
    direction: Math.floor(Math.random() * 360)
  });
const beautifulPresets = [
  // Playful Unicorn
  {
    name: 'Playful Unicorn',
    content: {
      text: '🦄',
      autoScale: true
    },
    shape: {
      type: 'circle',
      borderRadius: 50
    },
    size: {
      width: 140,
      height: 140
    },
    appearance: {
      fill: {
        type: 'gradient',
        gradient: {
          type: 'radial',
          colors: [
            '#FF6B9D',
            '#9D4EDD'
          ],
          direction: 0
        }
      },
      border: {
        width: 3,
        color: '#FFFFFF',
        style: 'solid'
      },
      shadow: {
        type: 'glow',
        color: '#FF6B9D',
        blur: 25,
        spread: 0,
        x: 0,
        y: 0
      }
    }
  },
  // Corporate Professional
  {
    name: 'Corporate Pro',
    content: {
      text: 'REC',
      autoScale: true
    },
    shape: {
      type: 'rectangle',
      borderRadius: 8
    },
    size: {
      width: 120,
      height: 80
    },
    appearance: {
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: [
            '#4A90E2',
            '#2C3E50'
          ],
          direction: 135
        }
      },
      border: {
        width: 2,
        color: '#34495E',
        style: 'solid'
      },
      shadow: {
        type: 'soft',
        color: '#000000',
        blur: 15,
        spread: 0,
        x: 0,
        y: 4
      }
    }
  },
  // Gaming Beast
  {
    name: 'Gaming Beast',
    content: {
      text: '⚡',
      autoScale: true
    },
    shape: {
      type: 'square',
      borderRadius: 15
    },
    size: {
      width: 160,
      height: 160
    },
    appearance: {
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: [
            '#00F5FF',
            '#8A2BE2'
          ],
          direction: 45
        }
      },
      border: {
        width: 6,
        color: '#FFD700',
        style: 'solid'
      },
      shadow: {
        type: 'glow',
        color: '#00F5FF',
        blur: 30,
        spread: 5,
        x: 0,
        y: 0
      }
    }
  },
  // Zen Minimal
  {
    name: 'Zen Minimal',
    content: {
      text: '●',
      autoScale: true
    },
    shape: {
      type: 'circle',
      borderRadius: 50
    },
    size: {
      width: 100,
      height: 100
    },
    appearance: {
      fill: {
        type: 'solid',
        solid: '#2C3E50'
      },
      border: {
        width: 1,
        color: '#34495E',
        style: 'solid'
      },
      shadow: {
        type: 'soft',
        color: '#000000',
        blur: 10,
        spread: 0,
        x: 0,
        y: 2
      }
    }
  },
  // Retro Boom
  {
    name: 'Retro Boom',
    content: {
      text: '📢',
      autoScale: true
    },
    shape: {
      type: 'rectangle',
      borderRadius: 20
    },
    size: {
      width: 150,
      height: 100
    },
    appearance: {
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          colors: [
            '#FF6B35',
            '#F7931E'
          ],
          direction: 90
        }
      },
      border: {
        width: 5,
        color: '#D2691E',
        style: 'solid'
      },
      shadow: {
        type: 'hard',
        color: '#8B4513',
        blur: 0,
        spread: 0,
        x: 8,
        y: 8
      }
    }
  },
  // Magic Sparkle
  {
    name: 'Magic Sparkle',
    content: {
      text: '✨',
      autoScale: true
    },
    shape: {
      type: 'square',
      borderRadius: 25
    },
    size: {
      width: 130,
      height: 130
    },
    appearance: {
      fill: {
        type: 'gradient',
        gradient: {
          type: 'radial',
          colors: [
            '#FFD700',
            '#DA70D6'
          ],
          direction: 0
        }
      },
      border: {
        width: 4,
        color: '#FFFFFF',
        style: 'solid'
      },
      shadow: {
        type: 'glow',
        color: '#FFD700',
        blur: 35,
        spread: 0,
        x: 0,
        y: 0
      }
    }
  }
];
export default function VoiceButtonStudio() {
  // Advanced randomization - millions of combinations!
  function surpriseMe() {
    const usePreset = Math.random() < 0.4 // 40% chance to use preset, 60% fully random
    ;
    if (usePreset) {
      // Use beautiful preset
      const randomPreset = beautifulPresets[Math.floor(Math.random() * beautifulPresets.length)];
      buttonConfig.value = {
        ...randomPreset
      };
      toast.success(`${randomPreset.name}! 🎲`);
    } else {
      // Generate completely random design
      const randomEmojis = [
        '🎤',
        '🎧',
        '🔊',
        '📢',
        '⚡',
        '✨',
        '🔥',
        '💎',
        '🌟',
        '🚀',
        '💖',
        '🦄',
        '🎵',
        '🎯',
        '💫'
      ];
      const randomShapes = [
        'circle',
        'square',
        'rectangle'
      ];
      const randomShape = randomShapes[Math.floor(Math.random() * randomShapes.length)];
      buttonConfig.value = {
        content: {
          text: randomEmojis[Math.floor(Math.random() * randomEmojis.length)],
          autoScale: true
        },
        size: {
          width: 80 + Math.floor(Math.random() * 120),
          height: 80 + Math.floor(Math.random() * 120),
          maintainRatio: randomShape === 'circle'
        },
        shape: {
          type: randomShape,
          borderRadius: randomShape === 'circle' ? 50 : Math.floor(Math.random() * 30)
        },
        appearance: {
          fill: {
            type: Math.random() > 0.3 ? 'gradient' : 'solid',
            solid: generateRandomColor(),
            gradient: generateRandomGradient()
          },
          border: {
            width: 1 + Math.floor(Math.random() * 8),
            color: generateRandomColor(),
            style: 'solid'
          },
          shadow: {
            type: [
              'none',
              'soft',
              'glow',
              'hard'
            ][Math.floor(Math.random() * 4)],
            color: generateRandomColor(),
            blur: Math.floor(Math.random() * 40),
            spread: Math.floor(Math.random() * 10),
            x: -10 + Math.floor(Math.random() * 20),
            y: -10 + Math.floor(Math.random() * 20)
          }
        }
      };
      toast.success('Random Magic! ✨');
    }
  }
  // Copy button code to clipboard
  function copyButtonCode() {
    const code = `<VoiceButton 
  buttonConfig={${JSON.stringify(buttonConfig.value, null, 2)}}
  enableHaptics={true}
  showTimer={true}
  showWaveform={true}
  onComplete={(result) => {
    console.log('Transcription:', result.text)
  }}
/>`;
    navigator.clipboard.writeText(code);
    toast.success('Magic copied to your spellbook! ✨');
  }
  return /*#__PURE__*/ _jsxs("div", {
    class: "w-full",
    children: [
      /*#__PURE__*/ _jsx(ToastContainer, {}),
      /*#__PURE__*/ _jsx("section", {
        class: "mb-12",
        children: /*#__PURE__*/ _jsxs("div", {
          class: "bg-soft-paper rounded-3xl shadow-soft-card p-12 text-center border border-soft-mist/30",
          children: [
            /*#__PURE__*/ _jsxs("div", {
              class: "inline-flex items-center gap-3 mb-6",
              children: [
                /*#__PURE__*/ _jsx("span", {
                  class: "text-2xl",
                  children: "👁️"
                }),
                /*#__PURE__*/ _jsx("h2", {
                  class: "text-3xl font-black text-soft-charcoal",
                  children: "Your Button"
                })
              ]
            }),
            /*#__PURE__*/ _jsx("p", {
              class: "text-soft-slate font-medium mb-8 text-lg",
              children: "Looking good! This is your voice button in all its glory ✨"
            }),
            /*#__PURE__*/ _jsx("div", {
              class: "flex justify-center mb-12",
              children: /*#__PURE__*/ _jsxs("div", {
                class: "relative",
                children: [
                  /*#__PURE__*/ _jsx(VoiceButton, {
                    buttonConfig: buttonConfig.value,
                    enableHaptics: true,
                    showTimer: true,
                    showWaveform: true,
                    onComplete: (result)=>{
                      console.log('🎉 Studio transcription:', result.text);
                    }
                  }),
                  /*#__PURE__*/ _jsx("div", {
                    class: "absolute inset-0 bg-gradient-to-r from-soft-peach/20 to-soft-coral/20 rounded-full blur-xl -z-10 scale-150"
                  })
                ]
              })
            }),
            /*#__PURE__*/ _jsxs("div", {
              class: "flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto",
              children: [
                /*#__PURE__*/ _jsx("button", {
                  onClick: surpriseMe,
                  class: "flex-1 bg-gradient-to-r from-soft-peach to-soft-coral text-white font-bold px-8 py-4 rounded-2xl shadow-button-surprise hover:shadow-chonky-hover hover:scale-[1.02] transition-all duration-200 text-lg",
                  children: "🎲 Roll the vibe dice"
                }),
                /*#__PURE__*/ _jsx("button", {
                  onClick: copyButtonCode,
                  class: "flex-1 bg-gradient-to-r from-soft-sunset to-soft-mint text-soft-charcoal font-bold px-8 py-4 rounded-2xl shadow-button-primary hover:shadow-chonky-hover hover:scale-[1.02] transition-all duration-200 text-lg",
                  children: "📋 Copy that magic"
                })
              ]
            })
          ]
        })
      }),
      /*#__PURE__*/ _jsxs("section", {
        class: "space-y-8",
        children: [
          /*#__PURE__*/ _jsxs("div", {
            class: "bg-soft-paper rounded-3xl shadow-soft-card p-8 border border-soft-mist/30",
            children: [
              /*#__PURE__*/ _jsxs("div", {
                class: "flex items-center gap-3 mb-6",
                children: [
                  /*#__PURE__*/ _jsx("span", {
                    class: "text-2xl",
                    children: "🎨"
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    children: [
                      /*#__PURE__*/ _jsx("h3", {
                        class: "text-2xl font-black text-soft-charcoal",
                        children: "Pick Your Vibe"
                      }),
                      /*#__PURE__*/ _jsx("p", {
                        class: "text-soft-slate font-medium",
                        children: "What's your button saying to the world?"
                      })
                    ]
                  })
                ]
              }),
              /*#__PURE__*/ _jsx("div", {
                class: "max-w-sm",
                children: /*#__PURE__*/ _jsx(EmojiPicker, {
                  value: buttonConfig.value.content.text,
                  onChange: (value)=>{
                    buttonConfig.value = {
                      ...buttonConfig.value,
                      content: {
                        ...buttonConfig.value.content,
                        text: value
                      }
                    };
                  },
                  placeholder: "🎤"
                })
              })
            ]
          }),
          /*#__PURE__*/ _jsxs("div", {
            class: "bg-soft-paper rounded-3xl shadow-soft-card p-8 border border-soft-mist/30",
            children: [
              /*#__PURE__*/ _jsxs("div", {
                class: "flex items-center gap-3 mb-6",
                children: [
                  /*#__PURE__*/ _jsx("span", {
                    class: "text-2xl",
                    children: "🔘"
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    children: [
                      /*#__PURE__*/ _jsx("h3", {
                        class: "text-2xl font-black text-soft-charcoal",
                        children: "Shape & Size"
                      }),
                      /*#__PURE__*/ _jsx("p", {
                        class: "text-soft-slate font-medium",
                        children: "Give your button a cozy silhouette"
                      })
                    ]
                  })
                ]
              }),
              /*#__PURE__*/ _jsxs("div", {
                class: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                children: [
                  /*#__PURE__*/ _jsxs("div", {
                    children: [
                      /*#__PURE__*/ _jsx("h4", {
                        class: "font-bold text-soft-charcoal mb-4 text-lg",
                        children: "Shape"
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        class: "grid grid-cols-3 gap-3",
                        children: [
                          'circle',
                          'square',
                          'rectangle'
                        ].map((shape)=>/*#__PURE__*/ _jsxs("button", {
                            onClick: ()=>{
                              buttonConfig.value = {
                                ...buttonConfig.value,
                                shape: {
                                  ...buttonConfig.value.shape,
                                  type: shape,
                                  borderRadius: shape === 'circle' ? 50 : shape === 'rectangle' ? 8 : 12
                                },
                                size: {
                                  ...buttonConfig.value.size,
                                  maintainRatio: shape === 'circle'
                                }
                              };
                            },
                            class: `p-4 rounded-2xl font-bold capitalize text-lg transition-all border-2 hover:scale-[1.02] ${buttonConfig.value.shape.type === shape ? 'border-soft-glow bg-soft-glow/10 text-soft-glow shadow-soft-glow' : 'border-soft-mist bg-white text-soft-slate hover:border-soft-peach'}`,
                            children: [
                              shape === 'circle' ? '●' : shape === 'square' ? '■' : '▬',
                              " ",
                              shape
                            ]
                          }, shape))
                      })
                    ]
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    children: [
                      /*#__PURE__*/ _jsx("h4", {
                        class: "font-bold text-soft-charcoal mb-4 text-lg",
                        children: "Size"
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        class: "grid grid-cols-2 gap-3",
                        children: [
                          {
                            size: 100,
                            label: 'Cute',
                            emoji: '🐣'
                          },
                          {
                            size: 140,
                            label: 'Perfect',
                            emoji: '✨'
                          },
                          {
                            size: 180,
                            label: 'Bold',
                            emoji: '💪'
                          },
                          {
                            size: 220,
                            label: 'Hero',
                            emoji: '🦸'
                          }
                        ].map(({ size, label, emoji })=>/*#__PURE__*/ _jsxs("button", {
                            onClick: ()=>{
                              buttonConfig.value = {
                                ...buttonConfig.value,
                                size: {
                                  ...buttonConfig.value.size,
                                  width: size,
                                  height: size
                                }
                              };
                            },
                            class: `p-4 rounded-2xl font-bold text-lg transition-all border-2 hover:scale-[1.02] ${Math.abs(buttonConfig.value.size.width - size) < 20 ? 'border-soft-glow bg-soft-glow/10 text-soft-glow shadow-soft-glow' : 'border-soft-mist bg-white text-soft-slate hover:border-soft-peach'}`,
                            children: [
                              emoji,
                              " ",
                              label,
                              /*#__PURE__*/ _jsxs("div", {
                                class: "text-sm text-soft-quiet mt-1",
                                children: [
                                  size,
                                  "px"
                                ]
                              })
                            ]
                          }, size))
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          /*#__PURE__*/ _jsxs("div", {
            class: "bg-soft-paper rounded-3xl shadow-soft-card border border-soft-mist/30 overflow-hidden",
            children: [
              /*#__PURE__*/ _jsx("button", {
                onClick: ()=>showAdvanced.value = !showAdvanced.value,
                class: "w-full p-8 text-left hover:bg-soft-mist/20 transition-colors",
                children: /*#__PURE__*/ _jsxs("div", {
                  class: "flex items-center justify-between",
                  children: [
                    /*#__PURE__*/ _jsxs("div", {
                      class: "flex items-center gap-3",
                      children: [
                        /*#__PURE__*/ _jsx("span", {
                          class: "text-2xl",
                          children: "⚡"
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                          children: [
                            /*#__PURE__*/ _jsx("h3", {
                              class: "text-2xl font-black text-soft-charcoal",
                              children: "Fine Tuning"
                            }),
                            /*#__PURE__*/ _jsx("p", {
                              class: "text-soft-slate font-medium",
                              children: "Get nerdy with the details"
                            })
                          ]
                        })
                      ]
                    }),
                    /*#__PURE__*/ _jsx("span", {
                      class: `text-2xl transition-transform ${showAdvanced.value ? 'rotate-180' : ''}`,
                      children: "▼"
                    })
                  ]
                })
              }),
              showAdvanced.value && /*#__PURE__*/ _jsxs("div", {
                class: "px-8 pb-8 border-t border-soft-mist/30 animate-slide-down",
                children: [
                  /*#__PURE__*/ _jsxs("div", {
                    class: "grid grid-cols-1 md:grid-cols-3 gap-6 pt-8",
                    children: [
                      /*#__PURE__*/ _jsx("div", {
                        children: /*#__PURE__*/ _jsx(SliderControl, {
                          label: "Roundness",
                          value: buttonConfig.value.shape.borderRadius,
                          min: 0,
                          max: 50,
                          onChange: (value)=>{
                            buttonConfig.value = {
                              ...buttonConfig.value,
                              shape: {
                                ...buttonConfig.value.shape,
                                borderRadius: value
                              }
                            };
                          },
                          unit: "px"
                        })
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        children: /*#__PURE__*/ _jsx(SliderControl, {
                          label: "Border Width",
                          value: buttonConfig.value.appearance.border.width,
                          min: 0,
                          max: 12,
                          onChange: (value)=>{
                            buttonConfig.value = {
                              ...buttonConfig.value,
                              appearance: {
                                ...buttonConfig.value.appearance,
                                border: {
                                  ...buttonConfig.value.appearance.border,
                                  width: value
                                }
                              }
                            };
                          },
                          unit: "px"
                        })
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        children: /*#__PURE__*/ _jsx(SliderControl, {
                          label: "Glow Intensity",
                          value: buttonConfig.value.appearance.shadow.blur,
                          min: 0,
                          max: 50,
                          onChange: (value)=>{
                            buttonConfig.value = {
                              ...buttonConfig.value,
                              appearance: {
                                ...buttonConfig.value.appearance,
                                shadow: {
                                  ...buttonConfig.value.appearance.shadow,
                                  blur: value
                                }
                              }
                            };
                          },
                          unit: "px"
                        })
                      })
                    ]
                  }),
                  /*#__PURE__*/ _jsx("div", {
                    class: "text-center mt-8 p-4 bg-soft-mist/30 rounded-2xl",
                    children: /*#__PURE__*/ _jsx("p", {
                      class: "text-soft-quiet font-medium",
                      children: "🚧 Color gradients, patterns & animations coming soon! 🚧"
                    })
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}
// Soft Stack Slider Control Component
function SliderControl({ label, value, min, max, step = 1, onChange, unit = '' }) {
  return /*#__PURE__*/ _jsxs("div", {
    class: "space-y-3",
    children: [
      /*#__PURE__*/ _jsxs("div", {
        class: "flex justify-between items-center",
        children: [
          /*#__PURE__*/ _jsx("label", {
            class: "font-bold text-soft-charcoal text-lg",
            children: label
          }),
          /*#__PURE__*/ _jsxs("span", {
            class: "text-soft-glow font-black text-xl bg-soft-glow/10 px-3 py-1 rounded-xl",
            children: [
              value,
              unit
            ]
          })
        ]
      }),
      /*#__PURE__*/ _jsx("div", {
        class: "relative",
        children: /*#__PURE__*/ _jsx("input", {
          type: "range",
          min: min,
          max: max,
          step: step,
          value: value,
          onInput: (e)=>onChange(Number(e.target.value)),
          class: "w-full h-4 bg-soft-mist rounded-xl appearance-none cursor-pointer slider-soft focus:outline-none",
          style: "background: linear-gradient(to right, #ff6b9d 0%, #ff6b9d calc(var(--value) * 1%), #f8f4f0 calc(var(--value) * 1%), #f8f4f0 100%); --value: var(--value, 50);"
        })
      })
    ]
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby9pc2xhbmRzL1ZvaWNlQnV0dG9uU3R1ZGlvLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduYWwgfSBmcm9tICdAcHJlYWN0L3NpZ25hbHMnXG5pbXBvcnQgVm9pY2VCdXR0b24gZnJvbSBcIi4uL2NvbXBvbmVudHMvVm9pY2VCdXR0b24udHN4XCI7XG5pbXBvcnQgVG9hc3RDb250YWluZXIsIHsgdG9hc3QgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9Ub2FzdC50c3hcIjtcbmltcG9ydCBFbW9qaVBpY2tlciBmcm9tIFwiLi4vY29tcG9uZW50cy9FbW9qaVBpY2tlci50c3hcIjtcblxuLy8gU2ltcGxlIGxpdmUgZGVzaWduIHN0YXRlIC0ganVzdCB0aGUgZXNzZW50aWFscyFcbi8vIENvbXBsZXRlIGJ1dHRvbiBjb25maWd1cmF0aW9uIHN0YXRlXG5jb25zdCBidXR0b25Db25maWcgPSBzaWduYWwoe1xuICBjb250ZW50OiB7XG4gICAgdGV4dDogJ/CfjqQnLFxuICAgIGF1dG9TY2FsZTogdHJ1ZVxuICB9LFxuICBzaXplOiB7XG4gICAgd2lkdGg6IDEyMCxcbiAgICBoZWlnaHQ6IDEyMCxcbiAgICBtYWludGFpblJhdGlvOiB0cnVlXG4gIH0sXG4gIHNoYXBlOiB7XG4gICAgdHlwZTogJ3NxdWFyZScgYXMgJ2NpcmNsZScgfCAnc3F1YXJlJyB8ICdyZWN0YW5nbGUnLFxuICAgIGJvcmRlclJhZGl1czogMTJcbiAgfSxcbiAgYXBwZWFyYW5jZToge1xuICAgIGZpbGw6IHtcbiAgICAgIHR5cGU6ICdncmFkaWVudCcgYXMgJ3NvbGlkJyB8ICdncmFkaWVudCcsXG4gICAgICBzb2xpZDogJyNGRjhGQTMnLFxuICAgICAgZ3JhZGllbnQ6IHtcbiAgICAgICAgdHlwZTogJ2xpbmVhcicgYXMgJ2xpbmVhcicgfCAncmFkaWFsJyxcbiAgICAgICAgY29sb3JzOiBbJyNGRjhGQTMnLCAnI0ZGQjhDQyddLFxuICAgICAgICBkaXJlY3Rpb246IDQ1XG4gICAgICB9XG4gICAgfSxcbiAgICBib3JkZXI6IHtcbiAgICAgIHdpZHRoOiA0LFxuICAgICAgY29sb3I6ICcjNEE0QTRBJyxcbiAgICAgIHN0eWxlOiAnc29saWQnIGFzICdzb2xpZCcgfCAnZGFzaGVkJyB8ICdkb3R0ZWQnXG4gICAgfSxcbiAgICBzaGFkb3c6IHtcbiAgICAgIHR5cGU6ICdnbG93JyBhcyAnbm9uZScgfCAnc29mdCcgfCAnaGFyZCcgfCAnZ2xvdycsXG4gICAgICBjb2xvcjogJyNGRjZCOUQnLFxuICAgICAgYmx1cjogMjAsXG4gICAgICBzcHJlYWQ6IDAsXG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH1cbiAgfVxufSlcblxuY29uc3Qgc2hvd0FkdmFuY2VkID0gc2lnbmFsPGJvb2xlYW4+KGZhbHNlKSAvLyBwcm9ncmVzc2l2ZSBkaXNjbG9zdXJlXG5cbi8vIENvbG9yLXJpY2ggcmFuZG9taXphdGlvbiBwcmVzZXRzIHdpdGggbWlsbGlvbnMgb2YgY29tYmluYXRpb25zXG5jb25zdCBnZW5lcmF0ZVJhbmRvbUNvbG9yID0gKCkgPT4ge1xuICBjb25zdCBodWUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApXG4gIGNvbnN0IHNhdHVyYXRpb24gPSA2MCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSAvLyA2MC0xMDAlXG4gIGNvbnN0IGxpZ2h0bmVzcyA9IDQ1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApIC8vIDQ1LTY1JVxuICByZXR1cm4gYGhzbCgke2h1ZX0sICR7c2F0dXJhdGlvbn0lLCAke2xpZ2h0bmVzc30lKWBcbn1cblxuY29uc3QgZ2VuZXJhdGVSYW5kb21HcmFkaWVudCA9ICgpID0+ICh7XG4gIHR5cGU6IE1hdGgucmFuZG9tKCkgPiAwLjcgPyAncmFkaWFsJyA6ICdsaW5lYXInIGFzICdsaW5lYXInIHwgJ3JhZGlhbCcsXG4gIGNvbG9yczogW2dlbmVyYXRlUmFuZG9tQ29sb3IoKSwgZ2VuZXJhdGVSYW5kb21Db2xvcigpXSxcbiAgZGlyZWN0aW9uOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApXG59KVxuXG5jb25zdCBiZWF1dGlmdWxQcmVzZXRzID0gW1xuICAvLyBQbGF5ZnVsIFVuaWNvcm5cbiAgeyBcbiAgICBuYW1lOiAnUGxheWZ1bCBVbmljb3JuJyxcbiAgICBjb250ZW50OiB7IHRleHQ6ICfwn6aEJywgYXV0b1NjYWxlOiB0cnVlIH0sXG4gICAgc2hhcGU6IHsgdHlwZTogJ2NpcmNsZScgYXMgY29uc3QsIGJvcmRlclJhZGl1czogNTAgfSxcbiAgICBzaXplOiB7IHdpZHRoOiAxNDAsIGhlaWdodDogMTQwIH0sXG4gICAgYXBwZWFyYW5jZToge1xuICAgICAgZmlsbDogeyB0eXBlOiAnZ3JhZGllbnQnIGFzIGNvbnN0LCBncmFkaWVudDogeyB0eXBlOiAncmFkaWFsJyBhcyBjb25zdCwgY29sb3JzOiBbJyNGRjZCOUQnLCAnIzlENEVERCddLCBkaXJlY3Rpb246IDAgfX0sXG4gICAgICBib3JkZXI6IHsgd2lkdGg6IDMsIGNvbG9yOiAnI0ZGRkZGRicsIHN0eWxlOiAnc29saWQnIGFzIGNvbnN0IH0sXG4gICAgICBzaGFkb3c6IHsgdHlwZTogJ2dsb3cnIGFzIGNvbnN0LCBjb2xvcjogJyNGRjZCOUQnLCBibHVyOiAyNSwgc3ByZWFkOiAwLCB4OiAwLCB5OiAwIH1cbiAgICB9XG4gIH0sXG4gIC8vIENvcnBvcmF0ZSBQcm9mZXNzaW9uYWxcbiAgeyBcbiAgICBuYW1lOiAnQ29ycG9yYXRlIFBybycsXG4gICAgY29udGVudDogeyB0ZXh0OiAnUkVDJywgYXV0b1NjYWxlOiB0cnVlIH0sXG4gICAgc2hhcGU6IHsgdHlwZTogJ3JlY3RhbmdsZScgYXMgY29uc3QsIGJvcmRlclJhZGl1czogOCB9LFxuICAgIHNpemU6IHsgd2lkdGg6IDEyMCwgaGVpZ2h0OiA4MCB9LFxuICAgIGFwcGVhcmFuY2U6IHtcbiAgICAgIGZpbGw6IHsgdHlwZTogJ2dyYWRpZW50JyBhcyBjb25zdCwgZ3JhZGllbnQ6IHsgdHlwZTogJ2xpbmVhcicgYXMgY29uc3QsIGNvbG9yczogWycjNEE5MEUyJywgJyMyQzNFNTAnXSwgZGlyZWN0aW9uOiAxMzUgfX0sXG4gICAgICBib3JkZXI6IHsgd2lkdGg6IDIsIGNvbG9yOiAnIzM0NDk1RScsIHN0eWxlOiAnc29saWQnIGFzIGNvbnN0IH0sXG4gICAgICBzaGFkb3c6IHsgdHlwZTogJ3NvZnQnIGFzIGNvbnN0LCBjb2xvcjogJyMwMDAwMDAnLCBibHVyOiAxNSwgc3ByZWFkOiAwLCB4OiAwLCB5OiA0IH1cbiAgICB9XG4gIH0sXG4gIC8vIEdhbWluZyBCZWFzdFxuICB7IFxuICAgIG5hbWU6ICdHYW1pbmcgQmVhc3QnLFxuICAgIGNvbnRlbnQ6IHsgdGV4dDogJ+KaoScsIGF1dG9TY2FsZTogdHJ1ZSB9LFxuICAgIHNoYXBlOiB7IHR5cGU6ICdzcXVhcmUnIGFzIGNvbnN0LCBib3JkZXJSYWRpdXM6IDE1IH0sXG4gICAgc2l6ZTogeyB3aWR0aDogMTYwLCBoZWlnaHQ6IDE2MCB9LFxuICAgIGFwcGVhcmFuY2U6IHtcbiAgICAgIGZpbGw6IHsgdHlwZTogJ2dyYWRpZW50JyBhcyBjb25zdCwgZ3JhZGllbnQ6IHsgdHlwZTogJ2xpbmVhcicgYXMgY29uc3QsIGNvbG9yczogWycjMDBGNUZGJywgJyM4QTJCRTInXSwgZGlyZWN0aW9uOiA0NSB9fSxcbiAgICAgIGJvcmRlcjogeyB3aWR0aDogNiwgY29sb3I6ICcjRkZENzAwJywgc3R5bGU6ICdzb2xpZCcgYXMgY29uc3QgfSxcbiAgICAgIHNoYWRvdzogeyB0eXBlOiAnZ2xvdycgYXMgY29uc3QsIGNvbG9yOiAnIzAwRjVGRicsIGJsdXI6IDMwLCBzcHJlYWQ6IDUsIHg6IDAsIHk6IDAgfVxuICAgIH1cbiAgfSxcbiAgLy8gWmVuIE1pbmltYWxcbiAgeyBcbiAgICBuYW1lOiAnWmVuIE1pbmltYWwnLFxuICAgIGNvbnRlbnQ6IHsgdGV4dDogJ+KXjycsIGF1dG9TY2FsZTogdHJ1ZSB9LFxuICAgIHNoYXBlOiB7IHR5cGU6ICdjaXJjbGUnIGFzIGNvbnN0LCBib3JkZXJSYWRpdXM6IDUwIH0sXG4gICAgc2l6ZTogeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9LFxuICAgIGFwcGVhcmFuY2U6IHtcbiAgICAgIGZpbGw6IHsgdHlwZTogJ3NvbGlkJyBhcyBjb25zdCwgc29saWQ6ICcjMkMzRTUwJyB9LFxuICAgICAgYm9yZGVyOiB7IHdpZHRoOiAxLCBjb2xvcjogJyMzNDQ5NUUnLCBzdHlsZTogJ3NvbGlkJyBhcyBjb25zdCB9LFxuICAgICAgc2hhZG93OiB7IHR5cGU6ICdzb2Z0JyBhcyBjb25zdCwgY29sb3I6ICcjMDAwMDAwJywgYmx1cjogMTAsIHNwcmVhZDogMCwgeDogMCwgeTogMiB9XG4gICAgfVxuICB9LFxuICAvLyBSZXRybyBCb29tXG4gIHsgXG4gICAgbmFtZTogJ1JldHJvIEJvb20nLFxuICAgIGNvbnRlbnQ6IHsgdGV4dDogJ/Cfk6InLCBhdXRvU2NhbGU6IHRydWUgfSxcbiAgICBzaGFwZTogeyB0eXBlOiAncmVjdGFuZ2xlJyBhcyBjb25zdCwgYm9yZGVyUmFkaXVzOiAyMCB9LFxuICAgIHNpemU6IHsgd2lkdGg6IDE1MCwgaGVpZ2h0OiAxMDAgfSxcbiAgICBhcHBlYXJhbmNlOiB7XG4gICAgICBmaWxsOiB7IHR5cGU6ICdncmFkaWVudCcgYXMgY29uc3QsIGdyYWRpZW50OiB7IHR5cGU6ICdsaW5lYXInIGFzIGNvbnN0LCBjb2xvcnM6IFsnI0ZGNkIzNScsICcjRjc5MzFFJ10sIGRpcmVjdGlvbjogOTAgfX0sXG4gICAgICBib3JkZXI6IHsgd2lkdGg6IDUsIGNvbG9yOiAnI0QyNjkxRScsIHN0eWxlOiAnc29saWQnIGFzIGNvbnN0IH0sXG4gICAgICBzaGFkb3c6IHsgdHlwZTogJ2hhcmQnIGFzIGNvbnN0LCBjb2xvcjogJyM4QjQ1MTMnLCBibHVyOiAwLCBzcHJlYWQ6IDAsIHg6IDgsIHk6IDggfVxuICAgIH1cbiAgfSxcbiAgLy8gTWFnaWMgU3BhcmtsZVxuICB7IFxuICAgIG5hbWU6ICdNYWdpYyBTcGFya2xlJyxcbiAgICBjb250ZW50OiB7IHRleHQ6ICfinKgnLCBhdXRvU2NhbGU6IHRydWUgfSxcbiAgICBzaGFwZTogeyB0eXBlOiAnc3F1YXJlJyBhcyBjb25zdCwgYm9yZGVyUmFkaXVzOiAyNSB9LFxuICAgIHNpemU6IHsgd2lkdGg6IDEzMCwgaGVpZ2h0OiAxMzAgfSxcbiAgICBhcHBlYXJhbmNlOiB7XG4gICAgICBmaWxsOiB7IHR5cGU6ICdncmFkaWVudCcgYXMgY29uc3QsIGdyYWRpZW50OiB7IHR5cGU6ICdyYWRpYWwnIGFzIGNvbnN0LCBjb2xvcnM6IFsnI0ZGRDcwMCcsICcjREE3MEQ2J10sIGRpcmVjdGlvbjogMCB9fSxcbiAgICAgIGJvcmRlcjogeyB3aWR0aDogNCwgY29sb3I6ICcjRkZGRkZGJywgc3R5bGU6ICdzb2xpZCcgYXMgY29uc3QgfSxcbiAgICAgIHNoYWRvdzogeyB0eXBlOiAnZ2xvdycgYXMgY29uc3QsIGNvbG9yOiAnI0ZGRDcwMCcsIGJsdXI6IDM1LCBzcHJlYWQ6IDAsIHg6IDAsIHk6IDAgfVxuICAgIH1cbiAgfVxuXVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBWb2ljZUJ1dHRvblN0dWRpbygpIHtcbiAgXG4gIC8vIEFkdmFuY2VkIHJhbmRvbWl6YXRpb24gLSBtaWxsaW9ucyBvZiBjb21iaW5hdGlvbnMhXG4gIGZ1bmN0aW9uIHN1cnByaXNlTWUoKSB7XG4gICAgY29uc3QgdXNlUHJlc2V0ID0gTWF0aC5yYW5kb20oKSA8IDAuNCAvLyA0MCUgY2hhbmNlIHRvIHVzZSBwcmVzZXQsIDYwJSBmdWxseSByYW5kb21cbiAgICBcbiAgICBpZiAodXNlUHJlc2V0KSB7XG4gICAgICAvLyBVc2UgYmVhdXRpZnVsIHByZXNldFxuICAgICAgY29uc3QgcmFuZG9tUHJlc2V0ID0gYmVhdXRpZnVsUHJlc2V0c1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBiZWF1dGlmdWxQcmVzZXRzLmxlbmd0aCldXG4gICAgICBidXR0b25Db25maWcudmFsdWUgPSB7IC4uLnJhbmRvbVByZXNldCB9XG4gICAgICB0b2FzdC5zdWNjZXNzKGAke3JhbmRvbVByZXNldC5uYW1lfSEg8J+OsmApXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEdlbmVyYXRlIGNvbXBsZXRlbHkgcmFuZG9tIGRlc2lnblxuICAgICAgY29uc3QgcmFuZG9tRW1vamlzID0gWyfwn46kJywgJ/CfjqcnLCAn8J+UiicsICfwn5OiJywgJ+KaoScsICfinKgnLCAn8J+UpScsICfwn5KOJywgJ/CfjJ8nLCAn8J+agCcsICfwn5KWJywgJ/CfpoQnLCAn8J+OtScsICfwn46vJywgJ/CfkqsnXVxuICAgICAgY29uc3QgcmFuZG9tU2hhcGVzID0gWydjaXJjbGUnLCAnc3F1YXJlJywgJ3JlY3RhbmdsZSddIGFzIGNvbnN0XG4gICAgICBjb25zdCByYW5kb21TaGFwZSA9IHJhbmRvbVNoYXBlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByYW5kb21TaGFwZXMubGVuZ3RoKV1cbiAgICAgIFxuICAgICAgYnV0dG9uQ29uZmlnLnZhbHVlID0ge1xuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgdGV4dDogcmFuZG9tRW1vamlzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJhbmRvbUVtb2ppcy5sZW5ndGgpXSxcbiAgICAgICAgICBhdXRvU2NhbGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgc2l6ZToge1xuICAgICAgICAgIHdpZHRoOiA4MCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEyMCksIC8vIDgwLTIwMHB4XG4gICAgICAgICAgaGVpZ2h0OiA4MCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEyMCksXG4gICAgICAgICAgbWFpbnRhaW5SYXRpbzogcmFuZG9tU2hhcGUgPT09ICdjaXJjbGUnXG4gICAgICAgIH0sXG4gICAgICAgIHNoYXBlOiB7XG4gICAgICAgICAgdHlwZTogcmFuZG9tU2hhcGUsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiByYW5kb21TaGFwZSA9PT0gJ2NpcmNsZScgPyA1MCA6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMwKVxuICAgICAgICB9LFxuICAgICAgICBhcHBlYXJhbmNlOiB7XG4gICAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgdHlwZTogTWF0aC5yYW5kb20oKSA+IDAuMyA/ICdncmFkaWVudCcgOiAnc29saWQnLFxuICAgICAgICAgICAgc29saWQ6IGdlbmVyYXRlUmFuZG9tQ29sb3IoKSxcbiAgICAgICAgICAgIGdyYWRpZW50OiBnZW5lcmF0ZVJhbmRvbUdyYWRpZW50KClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvcmRlcjoge1xuICAgICAgICAgICAgd2lkdGg6IDEgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA4KSwgLy8gMS04cHhcbiAgICAgICAgICAgIGNvbG9yOiBnZW5lcmF0ZVJhbmRvbUNvbG9yKCksXG4gICAgICAgICAgICBzdHlsZTogJ3NvbGlkJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2hhZG93OiB7XG4gICAgICAgICAgICB0eXBlOiBbJ25vbmUnLCAnc29mdCcsICdnbG93JywgJ2hhcmQnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV0gYXMgYW55LFxuICAgICAgICAgICAgY29sb3I6IGdlbmVyYXRlUmFuZG9tQ29sb3IoKSxcbiAgICAgICAgICAgIGJsdXI6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQwKSwgLy8gMC00MHB4XG4gICAgICAgICAgICBzcHJlYWQ6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSwgLy8gMC0xMHB4XG4gICAgICAgICAgICB4OiAtMTAgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCksIC8vIC0xMCB0byAxMHB4XG4gICAgICAgICAgICB5OiAtMTAgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdG9hc3Quc3VjY2VzcygnUmFuZG9tIE1hZ2ljISDinKgnKVxuICAgIH1cbiAgfVxuXG4gIC8vIENvcHkgYnV0dG9uIGNvZGUgdG8gY2xpcGJvYXJkXG4gIGZ1bmN0aW9uIGNvcHlCdXR0b25Db2RlKCkge1xuICAgIGNvbnN0IGNvZGUgPSBgPFZvaWNlQnV0dG9uIFxuICBidXR0b25Db25maWc9eyR7SlNPTi5zdHJpbmdpZnkoYnV0dG9uQ29uZmlnLnZhbHVlLCBudWxsLCAyKX19XG4gIGVuYWJsZUhhcHRpY3M9e3RydWV9XG4gIHNob3dUaW1lcj17dHJ1ZX1cbiAgc2hvd1dhdmVmb3JtPXt0cnVlfVxuICBvbkNvbXBsZXRlPXsocmVzdWx0KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1RyYW5zY3JpcHRpb246JywgcmVzdWx0LnRleHQpXG4gIH19XG4vPmBcbiAgICBcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb2RlKVxuICAgIHRvYXN0LnN1Y2Nlc3MoJ01hZ2ljIGNvcGllZCB0byB5b3VyIHNwZWxsYm9vayEg4pyoJylcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzcz1cInctZnVsbFwiPlxuICAgICAgPFRvYXN0Q29udGFpbmVyIC8+XG4gICAgICBcbiAgICAgIHsvKiBQcmV2aWV3IFNlY3Rpb24gLSBIZXJvIFN0eWxlICovfVxuICAgICAgPHNlY3Rpb24gY2xhc3M9XCJtYi0xMlwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiYmctc29mdC1wYXBlciByb3VuZGVkLTN4bCBzaGFkb3ctc29mdC1jYXJkIHAtMTIgdGV4dC1jZW50ZXIgYm9yZGVyIGJvcmRlci1zb2Z0LW1pc3QvMzBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0zIG1iLTZcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC0yeGxcIj7wn5GB77iPPC9zcGFuPlxuICAgICAgICAgICAgPGgyIGNsYXNzPVwidGV4dC0zeGwgZm9udC1ibGFjayB0ZXh0LXNvZnQtY2hhcmNvYWxcIj5cbiAgICAgICAgICAgICAgWW91ciBCdXR0b25cbiAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgXG4gICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNvZnQtc2xhdGUgZm9udC1tZWRpdW0gbWItOCB0ZXh0LWxnXCI+XG4gICAgICAgICAgICBMb29raW5nIGdvb2QhIFRoaXMgaXMgeW91ciB2b2ljZSBidXR0b24gaW4gYWxsIGl0cyBnbG9yeSDinKhcbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgXG4gICAgICAgICAgey8qIEhlcm8gQnV0dG9uIFByZXZpZXcgKi99XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgganVzdGlmeS1jZW50ZXIgbWItMTJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICA8Vm9pY2VCdXR0b24gXG4gICAgICAgICAgICAgICAgYnV0dG9uQ29uZmlnPXtidXR0b25Db25maWcudmFsdWV9XG4gICAgICAgICAgICAgICAgZW5hYmxlSGFwdGljcz17dHJ1ZX1cbiAgICAgICAgICAgICAgICBzaG93VGltZXI9e3RydWV9XG4gICAgICAgICAgICAgICAgc2hvd1dhdmVmb3JtPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uQ29tcGxldGU9eyhyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfwn46JIFN0dWRpbyB0cmFuc2NyaXB0aW9uOicsIHJlc3VsdC50ZXh0KVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHsvKiBBbWJpZW50IGdsb3cgYmVoaW5kIGJ1dHRvbiAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFic29sdXRlIGluc2V0LTAgYmctZ3JhZGllbnQtdG8tciBmcm9tLXNvZnQtcGVhY2gvMjAgdG8tc29mdC1jb3JhbC8yMCByb3VuZGVkLWZ1bGwgYmx1ci14bCAtei0xMCBzY2FsZS0xNTBcIj48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgey8qIEFjdGlvbiBCdXR0b25zIFJvdyAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBnYXAtNCBqdXN0aWZ5LWNlbnRlciBtYXgtdy1tZCBteC1hdXRvXCI+XG4gICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICBvbkNsaWNrPXtzdXJwcmlzZU1lfVxuICAgICAgICAgICAgICBjbGFzcz1cImZsZXgtMSBiZy1ncmFkaWVudC10by1yIGZyb20tc29mdC1wZWFjaCB0by1zb2Z0LWNvcmFsIHRleHQtd2hpdGUgZm9udC1ib2xkIHB4LTggcHktNCByb3VuZGVkLTJ4bCBzaGFkb3ctYnV0dG9uLXN1cnByaXNlIGhvdmVyOnNoYWRvdy1jaG9ua3ktaG92ZXIgaG92ZXI6c2NhbGUtWzEuMDJdIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCB0ZXh0LWxnXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAg8J+OsiBSb2xsIHRoZSB2aWJlIGRpY2VcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICBvbkNsaWNrPXtjb3B5QnV0dG9uQ29kZX1cbiAgICAgICAgICAgICAgY2xhc3M9XCJmbGV4LTEgYmctZ3JhZGllbnQtdG8tciBmcm9tLXNvZnQtc3Vuc2V0IHRvLXNvZnQtbWludCB0ZXh0LXNvZnQtY2hhcmNvYWwgZm9udC1ib2xkIHB4LTggcHktNCByb3VuZGVkLTJ4bCBzaGFkb3ctYnV0dG9uLXByaW1hcnkgaG92ZXI6c2hhZG93LWNob25reS1ob3ZlciBob3ZlcjpzY2FsZS1bMS4wMl0gdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIHRleHQtbGdcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICDwn5OLIENvcHkgdGhhdCBtYWdpY1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7LyogQ29udHJvbCBQYW5lbHMgU2VjdGlvbiAqL31cbiAgICAgIDxzZWN0aW9uIGNsYXNzPVwic3BhY2UteS04XCI+XG4gICAgICAgIFxuICAgICAgICB7LyogQ29udGVudCBQYW5lbCAqL31cbiAgICAgICAgPGRpdiBjbGFzcz1cImJnLXNvZnQtcGFwZXIgcm91bmRlZC0zeGwgc2hhZG93LXNvZnQtY2FyZCBwLTggYm9yZGVyIGJvcmRlci1zb2Z0LW1pc3QvMzBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItNlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LTJ4bFwiPvCfjqg8L3NwYW4+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtc29mdC1jaGFyY29hbFwiPlBpY2sgWW91ciBWaWJlPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNvZnQtc2xhdGUgZm9udC1tZWRpdW1cIj5XaGF0J3MgeW91ciBidXR0b24gc2F5aW5nIHRvIHRoZSB3b3JsZD88L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibWF4LXctc21cIj5cbiAgICAgICAgICAgIDxFbW9qaVBpY2tlciBcbiAgICAgICAgICAgICAgdmFsdWU9e2J1dHRvbkNvbmZpZy52YWx1ZS5jb250ZW50LnRleHR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBidXR0b25Db25maWcudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAuLi5idXR0b25Db25maWcudmFsdWUsXG4gICAgICAgICAgICAgICAgICBjb250ZW50OiB7IC4uLmJ1dHRvbkNvbmZpZy52YWx1ZS5jb250ZW50LCB0ZXh0OiB2YWx1ZSB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIvCfjqRcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIFNoYXBlICYgU2l6ZSBQYW5lbCAqL31cbiAgICAgICAgPGRpdiBjbGFzcz1cImJnLXNvZnQtcGFwZXIgcm91bmRlZC0zeGwgc2hhZG93LXNvZnQtY2FyZCBwLTggYm9yZGVyIGJvcmRlci1zb2Z0LW1pc3QvMzBcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItNlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LTJ4bFwiPvCflJg8L3NwYW4+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtc29mdC1jaGFyY29hbFwiPlNoYXBlICYgU2l6ZTwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzPVwidGV4dC1zb2Z0LXNsYXRlIGZvbnQtbWVkaXVtXCI+R2l2ZSB5b3VyIGJ1dHRvbiBhIGNvenkgc2lsaG91ZXR0ZTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC04XCI+XG4gICAgICAgICAgICB7LyogU2hhcGUgU2VsZWN0b3IgKi99XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJmb250LWJvbGQgdGV4dC1zb2Z0LWNoYXJjb2FsIG1iLTQgdGV4dC1sZ1wiPlNoYXBlPC9oND5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICB7KFsnY2lyY2xlJywgJ3NxdWFyZScsICdyZWN0YW5nbGUnXSBhcyBjb25zdCkubWFwKHNoYXBlID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PXtzaGFwZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbkNvbmZpZy52YWx1ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmJ1dHRvbkNvbmZpZy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlOiB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5idXR0b25Db25maWcudmFsdWUuc2hhcGUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBzaGFwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBzaGFwZSA9PT0gJ2NpcmNsZScgPyA1MCA6IChzaGFwZSA9PT0gJ3JlY3RhbmdsZScgPyA4IDogMTIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5idXR0b25Db25maWcudmFsdWUuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWFpbnRhaW5SYXRpbzogc2hhcGUgPT09ICdjaXJjbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz17YHAtNCByb3VuZGVkLTJ4bCBmb250LWJvbGQgY2FwaXRhbGl6ZSB0ZXh0LWxnIHRyYW5zaXRpb24tYWxsIGJvcmRlci0yIGhvdmVyOnNjYWxlLVsxLjAyXSAke1xuICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbkNvbmZpZy52YWx1ZS5zaGFwZS50eXBlID09PSBzaGFwZSBcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JvcmRlci1zb2Z0LWdsb3cgYmctc29mdC1nbG93LzEwIHRleHQtc29mdC1nbG93IHNoYWRvdy1zb2Z0LWdsb3cnIFxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnYm9yZGVyLXNvZnQtbWlzdCBiZy13aGl0ZSB0ZXh0LXNvZnQtc2xhdGUgaG92ZXI6Ym9yZGVyLXNvZnQtcGVhY2gnXG4gICAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7c2hhcGUgPT09ICdjaXJjbGUnID8gJ+KXjycgOiBzaGFwZSA9PT0gJ3NxdWFyZScgPyAn4pagJyA6ICfilqwnfSB7c2hhcGV9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIFNpemUgU2VsZWN0b3IgKi99XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJmb250LWJvbGQgdGV4dC1zb2Z0LWNoYXJjb2FsIG1iLTQgdGV4dC1sZ1wiPlNpemU8L2g0PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtM1wiPlxuICAgICAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgICAgICB7IHNpemU6IDEwMCwgbGFiZWw6ICdDdXRlJywgZW1vamk6ICfwn5CjJyB9LFxuICAgICAgICAgICAgICAgICAgeyBzaXplOiAxNDAsIGxhYmVsOiAnUGVyZmVjdCcsIGVtb2ppOiAn4pyoJyB9LFxuICAgICAgICAgICAgICAgICAgeyBzaXplOiAxODAsIGxhYmVsOiAnQm9sZCcsIGVtb2ppOiAn8J+SqicgfSxcbiAgICAgICAgICAgICAgICAgIHsgc2l6ZTogMjIwLCBsYWJlbDogJ0hlcm8nLCBlbW9qaTogJ/CfprgnIH1cbiAgICAgICAgICAgICAgICBdLm1hcCgoeyBzaXplLCBsYWJlbCwgZW1vamkgfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e3NpemV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBidXR0b25Db25maWcudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5idXR0b25Db25maWcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiB7IC4uLmJ1dHRvbkNvbmZpZy52YWx1ZS5zaXplLCB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPXtgcC00IHJvdW5kZWQtMnhsIGZvbnQtYm9sZCB0ZXh0LWxnIHRyYW5zaXRpb24tYWxsIGJvcmRlci0yIGhvdmVyOnNjYWxlLVsxLjAyXSAke1xuICAgICAgICAgICAgICAgICAgICAgIE1hdGguYWJzKGJ1dHRvbkNvbmZpZy52YWx1ZS5zaXplLndpZHRoIC0gc2l6ZSkgPCAyMFxuICAgICAgICAgICAgICAgICAgICAgICAgPyAnYm9yZGVyLXNvZnQtZ2xvdyBiZy1zb2Z0LWdsb3cvMTAgdGV4dC1zb2Z0LWdsb3cgc2hhZG93LXNvZnQtZ2xvdycgXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdib3JkZXItc29mdC1taXN0IGJnLXdoaXRlIHRleHQtc29mdC1zbGF0ZSBob3Zlcjpib3JkZXItc29mdC1wZWFjaCdcbiAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtlbW9qaX0ge2xhYmVsfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zbSB0ZXh0LXNvZnQtcXVpZXQgbXQtMVwiPntzaXplfXB4PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIEFkdmFuY2VkIFBhbmVsIChDb2xsYXBzaWJsZSkgKi99XG4gICAgICAgIDxkaXYgY2xhc3M9XCJiZy1zb2Z0LXBhcGVyIHJvdW5kZWQtM3hsIHNoYWRvdy1zb2Z0LWNhcmQgYm9yZGVyIGJvcmRlci1zb2Z0LW1pc3QvMzAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2hvd0FkdmFuY2VkLnZhbHVlID0gIXNob3dBZHZhbmNlZC52YWx1ZX1cbiAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsIHAtOCB0ZXh0LWxlZnQgaG92ZXI6Ymctc29mdC1taXN0LzIwIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC0yeGxcIj7imqE8L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC1zb2Z0LWNoYXJjb2FsXCI+RmluZSBUdW5pbmc8L2gzPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNvZnQtc2xhdGUgZm9udC1tZWRpdW1cIj5HZXQgbmVyZHkgd2l0aCB0aGUgZGV0YWlsczwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPXtgdGV4dC0yeGwgdHJhbnNpdGlvbi10cmFuc2Zvcm0gJHtzaG93QWR2YW5jZWQudmFsdWUgPyAncm90YXRlLTE4MCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICDilrxcbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICB7c2hvd0FkdmFuY2VkLnZhbHVlICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJweC04IHBiLTggYm9yZGVyLXQgYm9yZGVyLXNvZnQtbWlzdC8zMCBhbmltYXRlLXNsaWRlLWRvd25cIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTYgcHQtOFwiPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8U2xpZGVyQ29udHJvbFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD1cIlJvdW5kbmVzc1wiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtidXR0b25Db25maWcudmFsdWUuc2hhcGUuYm9yZGVyUmFkaXVzfVxuICAgICAgICAgICAgICAgICAgICBtaW49ezB9XG4gICAgICAgICAgICAgICAgICAgIG1heD17NTB9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBidXR0b25Db25maWcudmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5idXR0b25Db25maWcudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFwZTogeyAuLi5idXR0b25Db25maWcudmFsdWUuc2hhcGUsIGJvcmRlclJhZGl1czogdmFsdWUgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdW5pdD1cInB4XCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxTbGlkZXJDb250cm9sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPVwiQm9yZGVyIFdpZHRoXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2J1dHRvbkNvbmZpZy52YWx1ZS5hcHBlYXJhbmNlLmJvcmRlci53aWR0aH1cbiAgICAgICAgICAgICAgICAgICAgbWluPXswfVxuICAgICAgICAgICAgICAgICAgICBtYXg9ezEyfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgYnV0dG9uQ29uZmlnLnZhbHVlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZWFyYW5jZTogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLmFwcGVhcmFuY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6IHsgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLmFwcGVhcmFuY2UuYm9yZGVyLCB3aWR0aDogdmFsdWUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgdW5pdD1cInB4XCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPFNsaWRlckNvbnRyb2xcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9XCJHbG93IEludGVuc2l0eVwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtidXR0b25Db25maWcudmFsdWUuYXBwZWFyYW5jZS5zaGFkb3cuYmx1cn1cbiAgICAgICAgICAgICAgICAgICAgbWluPXswfVxuICAgICAgICAgICAgICAgICAgICBtYXg9ezUwfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgYnV0dG9uQ29uZmlnLnZhbHVlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZWFyYW5jZTogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLmFwcGVhcmFuY2UsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFkb3c6IHsgLi4uYnV0dG9uQ29uZmlnLnZhbHVlLmFwcGVhcmFuY2Uuc2hhZG93LCBibHVyOiB2YWx1ZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB1bml0PVwicHhcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXIgbXQtOCBwLTQgYmctc29mdC1taXN0LzMwIHJvdW5kZWQtMnhsXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXNvZnQtcXVpZXQgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICAgIPCfmqcgQ29sb3IgZ3JhZGllbnRzLCBwYXR0ZXJucyAmIGFuaW1hdGlvbnMgY29taW5nIHNvb24hIPCfmqdcbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuXG4vLyBTb2Z0IFN0YWNrIFNsaWRlciBDb250cm9sIENvbXBvbmVudFxuZnVuY3Rpb24gU2xpZGVyQ29udHJvbCh7IGxhYmVsLCB2YWx1ZSwgbWluLCBtYXgsIHN0ZXAgPSAxLCBvbkNoYW5nZSwgdW5pdCA9ICcnIH06IHtcbiAgbGFiZWw6IHN0cmluZ1xuICB2YWx1ZTogbnVtYmVyXG4gIG1pbjogbnVtYmVyXG4gIG1heDogbnVtYmVyXG4gIHN0ZXA/OiBudW1iZXJcbiAgb25DaGFuZ2U6ICh2YWx1ZTogbnVtYmVyKSA9PiB2b2lkXG4gIHVuaXQ/OiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwic3BhY2UteS0zXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCI+XG4gICAgICAgIDxsYWJlbCBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LXNvZnQtY2hhcmNvYWwgdGV4dC1sZ1wiPntsYWJlbH08L2xhYmVsPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc29mdC1nbG93IGZvbnQtYmxhY2sgdGV4dC14bCBiZy1zb2Z0LWdsb3cvMTAgcHgtMyBweS0xIHJvdW5kZWQteGxcIj5cbiAgICAgICAgICB7dmFsdWV9e3VuaXR9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInJlbGF0aXZlXCI+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJyYW5nZVwiXG4gICAgICAgICAgbWluPXttaW59XG4gICAgICAgICAgbWF4PXttYXh9XG4gICAgICAgICAgc3RlcD17c3RlcH1cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25JbnB1dD17KGUpID0+IG9uQ2hhbmdlKE51bWJlcigoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpKX1cbiAgICAgICAgICBjbGFzcz1cInctZnVsbCBoLTQgYmctc29mdC1taXN0IHJvdW5kZWQteGwgYXBwZWFyYW5jZS1ub25lIGN1cnNvci1wb2ludGVyIHNsaWRlci1zb2Z0IGZvY3VzOm91dGxpbmUtbm9uZVwiXG4gICAgICAgICAgc3R5bGU9XCJiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gcmlnaHQsICNmZjZiOWQgMCUsICNmZjZiOWQgY2FsYyh2YXIoLS12YWx1ZSkgKiAxJSksICNmOGY0ZjAgY2FsYyh2YXIoLS12YWx1ZSkgKiAxJSksICNmOGY0ZjAgMTAwJSk7IC0tdmFsdWU6IHZhcigtLXZhbHVlLCA1MCk7XCJcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTLE1BQU0sUUFBUSxrQkFBaUI7QUFDeEMsT0FBTyxpQkFBaUIsZ0NBQWdDO0FBQ3hELE9BQU8sa0JBQWtCLEtBQUssUUFBUSwwQkFBMEI7QUFDaEUsT0FBTyxpQkFBaUIsZ0NBQWdDO0FBRXhELGtEQUFrRDtBQUNsRCxzQ0FBc0M7QUFDdEMsTUFBTSxlQUFlLE9BQU87RUFDMUIsU0FBUztJQUNQLE1BQU07SUFDTixXQUFXO0VBQ2I7RUFDQSxNQUFNO0lBQ0osT0FBTztJQUNQLFFBQVE7SUFDUixlQUFlO0VBQ2pCO0VBQ0EsT0FBTztJQUNMLE1BQU07SUFDTixjQUFjO0VBQ2hCO0VBQ0EsWUFBWTtJ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
// denoCacheMetadata=5765951078255651638,13344845087849443333