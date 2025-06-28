import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
const isOpen = signal(false);
// Common emojis organized by category
const emojiCategories = {
  'Voice & Sound': [
    '🎤',
    '🎧',
    '🔊',
    '📢',
    '📣',
    '🎵',
    '🎶',
    '🔉',
    '🔔',
    '📯'
  ],
  'Smileys': [
    '😊',
    '😂',
    '🥰',
    '😎',
    '🤔',
    '😍',
    '🙂',
    '😃',
    '😄',
    '😆'
  ],
  'Hands': [
    '👋',
    '✋',
    '🤚',
    '🖐️',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '👌',
    '🤏'
  ],
  'Objects': [
    '💎',
    '⭐',
    '✨',
    '🔥',
    '💡',
    '🎯',
    '🚀',
    '💫',
    '⚡',
    '🌟'
  ],
  'Hearts': [
    '❤️',
    '💖',
    '💕',
    '💓',
    '💗',
    '💘',
    '💝',
    '💟',
    '❣️',
    '💔'
  ],
  'Arrows': [
    '➡️',
    '⬅️',
    '⬆️',
    '⬇️',
    '↗️',
    '↖️',
    '↙️',
    '↘️',
    '🔄',
    '🔃'
  ]
};
export default function EmojiPicker({ value, onChange, placeholder = '🎤' }) {
  const containerRef = useRef(null);
  // Close picker when clicking outside
  useEffect(()=>{
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        isOpen.value = false;
      }
    }
    if (isOpen.value) {
      document.addEventListener('mousedown', handleClickOutside);
      return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [
    isOpen.value
  ]);
  function selectEmoji(emoji) {
    onChange(emoji);
    isOpen.value = false;
  }
  return /*#__PURE__*/ _jsxs("div", {
    class: "relative",
    ref: containerRef,
    children: [
      /*#__PURE__*/ _jsxs("button", {
        type: "button",
        onClick: ()=>isOpen.value = !isOpen.value,
        class: "w-full p-3 border-3 border-flamingo-primary rounded-chunky font-chunky text-center text-lg focus:outline-none focus:border-flamingo-purple hover:border-flamingo-purple transition-colors flex items-center justify-between",
        children: [
          /*#__PURE__*/ _jsx("span", {
            class: "text-2xl",
            children: value || placeholder
          }),
          /*#__PURE__*/ _jsx("span", {
            class: "text-flamingo-purple text-sm",
            children: isOpen.value ? '▲' : '▼'
          })
        ]
      }),
      isOpen.value && /*#__PURE__*/ _jsx("div", {
        class: "absolute top-full left-0 right-0 mt-2 bg-white border-3 border-flamingo-primary rounded-chunky shadow-lg z-50 max-h-80 overflow-y-auto",
        children: /*#__PURE__*/ _jsxs("div", {
          class: "p-4 space-y-4",
          children: [
            Object.entries(emojiCategories).map(([categoryName, emojis])=>/*#__PURE__*/ _jsxs("div", {
                children: [
                  /*#__PURE__*/ _jsx("h4", {
                    class: "text-xs font-chunky text-flamingo-charcoal mb-2 uppercase tracking-wide",
                    children: categoryName
                  }),
                  /*#__PURE__*/ _jsx("div", {
                    class: "grid grid-cols-5 gap-2",
                    children: emojis.map((emoji)=>/*#__PURE__*/ _jsx("button", {
                        type: "button",
                        onClick: ()=>selectEmoji(emoji),
                        class: "w-8 h-8 flex items-center justify-center text-lg hover:bg-flamingo-cream rounded-md transition-colors",
                        title: emoji,
                        children: emoji
                      }, emoji))
                  })
                ]
              }, categoryName)),
            /*#__PURE__*/ _jsxs("div", {
              class: "border-t-2 border-flamingo-cream pt-4",
              children: [
                /*#__PURE__*/ _jsx("h4", {
                  class: "text-xs font-chunky text-flamingo-charcoal mb-2 uppercase tracking-wide",
                  children: "Custom Text"
                }),
                /*#__PURE__*/ _jsx("input", {
                  type: "text",
                  placeholder: "Type any text...",
                  class: "w-full p-2 border-2 border-flamingo-concrete rounded-md text-sm focus:outline-none focus:border-flamingo-purple",
                  onKeyDown: (e)=>{
                    if (e.key === 'Enter') {
                      const target = e.target;
                      if (target.value.trim()) {
                        selectEmoji(target.value.trim());
                        target.value = '';
                      }
                    }
                  }
                }),
                /*#__PURE__*/ _jsx("p", {
                  class: "text-xs text-flamingo-purple mt-1",
                  children: "Press Enter to use"
                })
              ]
            })
          ]
        })
      })
    ]
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby9jb21wb25lbnRzL0Vtb2ppUGlja2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduYWwgfSBmcm9tICdAcHJlYWN0L3NpZ25hbHMnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3ByZWFjdC9ob29rcydcblxuaW50ZXJmYWNlIEVtb2ppUGlja2VyUHJvcHMge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9uQ2hhbmdlOiAoZW1vamk6IHN0cmluZykgPT4gdm9pZFxuICBwbGFjZWhvbGRlcj86IHN0cmluZ1xufVxuXG5jb25zdCBpc09wZW4gPSBzaWduYWw8Ym9vbGVhbj4oZmFsc2UpXG5cbi8vIENvbW1vbiBlbW9qaXMgb3JnYW5pemVkIGJ5IGNhdGVnb3J5XG5jb25zdCBlbW9qaUNhdGVnb3JpZXMgPSB7XG4gICdWb2ljZSAmIFNvdW5kJzogWyfwn46kJywgJ/CfjqcnLCAn8J+UiicsICfwn5OiJywgJ/Cfk6MnLCAn8J+OtScsICfwn462JywgJ/CflIknLCAn8J+UlCcsICfwn5OvJ10sXG4gICdTbWlsZXlzJzogWyfwn5iKJywgJ/CfmIInLCAn8J+lsCcsICfwn5iOJywgJ/CfpJQnLCAn8J+YjScsICfwn5mCJywgJ/CfmIMnLCAn8J+YhCcsICfwn5iGJ10sXG4gICdIYW5kcyc6IFsn8J+RiycsICfinIsnLCAn8J+kmicsICfwn5aQ77iPJywgJ+KcjO+4jycsICfwn6SeJywgJ/CfpJ8nLCAn8J+kmCcsICfwn5GMJywgJ/CfpI8nXSxcbiAgJ09iamVjdHMnOiBbJ/Cfko4nLCAn4q2QJywgJ+KcqCcsICfwn5SlJywgJ/CfkqEnLCAn8J+OrycsICfwn5qAJywgJ/CfkqsnLCAn4pqhJywgJ/CfjJ8nXSxcbiAgJ0hlYXJ0cyc6IFsn4p2k77iPJywgJ/CfkpYnLCAn8J+SlScsICfwn5KTJywgJ/CfkpcnLCAn8J+SmCcsICfwn5KdJywgJ/Cfkp8nLCAn4p2j77iPJywgJ/CfkpQnXSxcbiAgJ0Fycm93cyc6IFsn4p6h77iPJywgJ+Kshe+4jycsICfirIbvuI8nLCAn4qyH77iPJywgJ+KGl++4jycsICfihpbvuI8nLCAn4oaZ77iPJywgJ+KGmO+4jycsICfwn5SEJywgJ/CflIMnXVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFbW9qaVBpY2tlcih7IHZhbHVlLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAn8J+OpCcgfTogRW1vamlQaWNrZXJQcm9wcykge1xuICBjb25zdCBjb250YWluZXJSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG5cbiAgLy8gQ2xvc2UgcGlja2VyIHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGhhbmRsZUNsaWNrT3V0c2lkZShldmVudDogTW91c2VFdmVudCkge1xuICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50ICYmICFjb250YWluZXJSZWYuY3VycmVudC5jb250YWlucyhldmVudC50YXJnZXQgYXMgTm9kZSkpIHtcbiAgICAgICAgaXNPcGVuLnZhbHVlID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNPcGVuLnZhbHVlKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVDbGlja091dHNpZGUpXG4gICAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgaGFuZGxlQ2xpY2tPdXRzaWRlKVxuICAgIH1cbiAgfSwgW2lzT3Blbi52YWx1ZV0pXG5cbiAgZnVuY3Rpb24gc2VsZWN0RW1vamkoZW1vamk6IHN0cmluZykge1xuICAgIG9uQ2hhbmdlKGVtb2ppKVxuICAgIGlzT3Blbi52YWx1ZSA9IGZhbHNlXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3M9XCJyZWxhdGl2ZVwiIHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgIHsvKiBDdXJyZW50IFZhbHVlIEJ1dHRvbiAqL31cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IGlzT3Blbi52YWx1ZSA9ICFpc09wZW4udmFsdWV9XG4gICAgICAgIGNsYXNzPVwidy1mdWxsIHAtMyBib3JkZXItMyBib3JkZXItZmxhbWluZ28tcHJpbWFyeSByb3VuZGVkLWNodW5reSBmb250LWNodW5reSB0ZXh0LWNlbnRlciB0ZXh0LWxnIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpib3JkZXItZmxhbWluZ28tcHVycGxlIGhvdmVyOmJvcmRlci1mbGFtaW5nby1wdXJwbGUgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCJcbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LTJ4bFwiPnt2YWx1ZSB8fCBwbGFjZWhvbGRlcn08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1mbGFtaW5nby1wdXJwbGUgdGV4dC1zbVwiPlxuICAgICAgICAgIHtpc09wZW4udmFsdWUgPyAn4payJyA6ICfilrwnfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cblxuICAgICAgey8qIEVtb2ppIFBpY2tlciBEcm9wZG93biAqL31cbiAgICAgIHtpc09wZW4udmFsdWUgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzPVwiYWJzb2x1dGUgdG9wLWZ1bGwgbGVmdC0wIHJpZ2h0LTAgbXQtMiBiZy13aGl0ZSBib3JkZXItMyBib3JkZXItZmxhbWluZ28tcHJpbWFyeSByb3VuZGVkLWNodW5reSBzaGFkb3ctbGcgei01MCBtYXgtaC04MCBvdmVyZmxvdy15LWF1dG9cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicC00IHNwYWNlLXktNFwiPlxuICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKGVtb2ppQ2F0ZWdvcmllcykubWFwKChbY2F0ZWdvcnlOYW1lLCBlbW9qaXNdKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtjYXRlZ29yeU5hbWV9PlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzcz1cInRleHQteHMgZm9udC1jaHVua3kgdGV4dC1mbGFtaW5nby1jaGFyY29hbCBtYi0yIHVwcGVyY2FzZSB0cmFja2luZy13aWRlXCI+XG4gICAgICAgICAgICAgICAgICB7Y2F0ZWdvcnlOYW1lfVxuICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQgZ3JpZC1jb2xzLTUgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgIHtlbW9qaXMubWFwKGVtb2ppID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGtleT17ZW1vaml9XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0RW1vamkoZW1vamkpfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwidy04IGgtOCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LWxnIGhvdmVyOmJnLWZsYW1pbmdvLWNyZWFtIHJvdW5kZWQtbWQgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtlbW9qaX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtlbW9qaX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgey8qIFRleHQgSW5wdXQgZm9yIEN1c3RvbSAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJib3JkZXItdC0yIGJvcmRlci1mbGFtaW5nby1jcmVhbSBwdC00XCI+XG4gICAgICAgICAgICAgIDxoNCBjbGFzcz1cInRleHQteHMgZm9udC1jaHVua3kgdGV4dC1mbGFtaW5nby1jaGFyY29hbCBtYi0yIHVwcGVyY2FzZSB0cmFja2luZy13aWRlXCI+XG4gICAgICAgICAgICAgICAgQ3VzdG9tIFRleHRcbiAgICAgICAgICAgICAgPC9oND5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVHlwZSBhbnkgdGV4dC4uLlwiXG4gICAgICAgICAgICAgICAgY2xhc3M9XCJ3LWZ1bGwgcC0yIGJvcmRlci0yIGJvcmRlci1mbGFtaW5nby1jb25jcmV0ZSByb3VuZGVkLW1kIHRleHQtc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOmJvcmRlci1mbGFtaW5nby1wdXJwbGVcIlxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQudmFsdWUudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZWN0RW1vamkodGFyZ2V0LnZhbHVlLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQudmFsdWUgPSAnJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtZmxhbWluZ28tcHVycGxlIG10LTFcIj5QcmVzcyBFbnRlciB0byB1c2U8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApXG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTLE1BQU0sUUFBUSxrQkFBaUI7QUFDeEMsU0FBUyxTQUFTLEVBQUUsTUFBTSxRQUFRLGVBQWM7QUFRaEQsTUFBTSxTQUFTLE9BQWdCO0FBRS9CLHNDQUFzQztBQUN0QyxNQUFNLGtCQUFrQjtFQUN0QixpQkFBaUI7SUFBQztJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtHQUFLO0VBQzdFLFdBQVc7SUFBQztJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtHQUFLO0VBQ3ZFLFNBQVM7SUFBQztJQUFNO0lBQUs7SUFBTTtJQUFPO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtHQUFLO0VBQ3JFLFdBQVc7SUFBQztJQUFNO0lBQUs7SUFBSztJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBSztHQUFLO0VBQ3BFLFVBQVU7SUFBQztJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtHQUFLO0VBQ3RFLFVBQVU7SUFBQztJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtJQUFNO0lBQU07SUFBTTtHQUFLO0FBQ3hFO0FBRUEsZUFBZSxTQUFTLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGNBQWMsSUFBSSxFQUFvQjtFQUMzRixNQUFNLGVBQWUsT0FBdUI7RUFFNUMscUNBQXFDO0VBQ3JDLFVBQVU7SUFDUixTQUFTLG1CQUFtQixLQUFpQjtNQUMzQyxJQUFJLGFBQWEsT0FBTyxJQUFJLENBQUMsYUFBYSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sTUFBTSxHQUFXO1FBQ2hGLE9BQU8sS0FBSyxHQUFHO01BQ2pCO0lBQ0Y7SUFFQSxJQUFJLE9BQU8sS0FBSyxFQUFFO01BQ2hCLFNBQVMsZ0JBQWdCLENBQUMsYUFBYTtNQUN2QyxPQUFPLElBQU0sU0FBUyxtQkFBbUIsQ0FBQyxhQUFhO0lBQ3pEO0VBQ0YsR0FBRztJQUFDLE9BQU8sS0FBSztHQUFDO0VBRWpCLFNBQVMsWUFBWSxLQUFhO0lBQ2hDLFNBQVM7SUFDVCxPQUFPLEtBQUssR0FBRztFQUNqQjtFQUVBLHFCQUNFLE1BQUM7SUFBSSxPQUFNO0lBQVcsS0FBSzs7b0JBRXpCLE1BQUM7UUFDQyxNQUFLO1FBQ0wsU0FBUyxJQUFNLE9BQU8sS0FBSyxHQUFHLENBQUMsT0FBTyxLQUFLO1FBQzNDLE9BQU07O3dCQUVOLEtBQUM7WUFBSyxPQUFNO3NCQUFZLFNBQVM7O3dCQUNqQyxLQUFDO1lBQUssT0FBTTtzQkFDVCxPQUFPLEtBQUssR0FBRyxNQUFNOzs7O01BS3pCLE9BQU8sS0FBSyxrQkFDWCxLQUFDO1FBQUksT0FBTTtrQkFDVCxjQUFBLE1BQUM7VUFBSSxPQUFNOztZQUNSLE9BQU8sT0FBTyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsT0FBTyxpQkFDMUQsTUFBQzs7Z0NBQ0MsS0FBQztvQkFBRyxPQUFNOzhCQUNQOztnQ0FFSCxLQUFDO29CQUFJLE9BQU07OEJBQ1IsT0FBTyxHQUFHLENBQUMsQ0FBQSxzQkFDVixLQUFDO3dCQUVDLE1BQUs7d0JBQ0wsU0FBUyxJQUFNLFlBQVk7d0JBQzNCLE9BQU07d0JBQ04sT0FBTztrQ0FFTjt5QkFOSTs7O2lCQVBIOzBCQXFCWixNQUFDO2NBQUksT0FBTTs7OEJBQ1QsS0FBQztrQkFBRyxPQUFNOzRCQUEwRTs7OEJBR3BGLEtBQUM7a0JBQ0MsTUFBSztrQkFDTCxhQUFZO2tCQUNaLE9BQU07a0JBQ04sV0FBVyxDQUFDO29CQUNWLElBQUksRUFBRSxHQUFHLEtBQUssU0FBUztzQkFDckIsTUFBTSxTQUFTLEVBQUUsTUFBTTtzQkFDdkIsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLElBQUk7d0JBQ3ZCLFlBQVksT0FBTyxLQUFLLENBQUMsSUFBSTt3QkFDN0IsT0FBTyxLQUFLLEdBQUc7c0JBQ2pCO29CQUNGO2tCQUNGOzs4QkFFRixLQUFDO2tCQUFFLE9BQU07NEJBQW9DOzs7Ozs7Ozs7QUFPM0QifQ==
// denoCacheMetadata=11891235919221764724,17607366241413168168