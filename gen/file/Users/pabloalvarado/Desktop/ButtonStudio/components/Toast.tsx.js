import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { signal } from '@preact/signals';
const toasts = signal([]);
// Toast API
export const toast = {
  success: (message, duration = 3000)=>{
    const id = Date.now().toString();
    toasts.value = [
      ...toasts.value,
      {
        id,
        type: 'success',
        message,
        duration
      }
    ];
    setTimeout(()=>{
      toasts.value = toasts.value.filter((t)=>t.id !== id);
    }, duration);
  },
  error: (message, duration = 4000)=>{
    const id = Date.now().toString();
    toasts.value = [
      ...toasts.value,
      {
        id,
        type: 'error',
        message,
        duration
      }
    ];
    setTimeout(()=>{
      toasts.value = toasts.value.filter((t)=>t.id !== id);
    }, duration);
  },
  info: (message, duration = 3000)=>{
    const id = Date.now().toString();
    toasts.value = [
      ...toasts.value,
      {
        id,
        type: 'info',
        message,
        duration
      }
    ];
    setTimeout(()=>{
      toasts.value = toasts.value.filter((t)=>t.id !== id);
    }, duration);
  }
};
// Toast Container Component
export default function ToastContainer() {
  return /*#__PURE__*/ _jsx("div", {
    class: "fixed top-4 right-4 z-50 space-y-2",
    children: toasts.value.map((toast)=>/*#__PURE__*/ _jsx(ToastItem, {
        toast: toast
      }, toast.id))
  });
}
// Individual Toast Component
function ToastItem({ toast: toastItem }) {
  const bgColor = {
    success: 'bg-flamingo-purple/90 text-white',
    error: 'bg-flamingo-coral/90 text-white',
    info: 'bg-flamingo-charcoal/90 text-white'
  };
  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  return /*#__PURE__*/ _jsxs("div", {
    class: `
      ${bgColor[toastItem.type]}
      px-4 py-3 rounded-chunky border-3 border-white/20
      font-chunky text-sm tracking-wide
      transform animate-slide-in-right
      backdrop-blur-sm shadow-lg
      flex items-center gap-2
      max-w-sm
    `,
    children: [
      /*#__PURE__*/ _jsx("span", {
        children: icon[toastItem.type]
      }),
      /*#__PURE__*/ _jsx("span", {
        children: toastItem.message
      })
    ]
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby9jb21wb25lbnRzL1RvYXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzaWduYWwgfSBmcm9tICdAcHJlYWN0L3NpZ25hbHMnXG5pbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdwcmVhY3QvaG9va3MnXG5cbi8vIFRvYXN0IHN0YXRlIG1hbmFnZW1lbnRcbmludGVyZmFjZSBUb2FzdE1lc3NhZ2Uge1xuICBpZDogc3RyaW5nXG4gIHR5cGU6ICdzdWNjZXNzJyB8ICdlcnJvcicgfCAnaW5mbydcbiAgbWVzc2FnZTogc3RyaW5nXG4gIGR1cmF0aW9uPzogbnVtYmVyXG59XG5cbmNvbnN0IHRvYXN0cyA9IHNpZ25hbDxUb2FzdE1lc3NhZ2VbXT4oW10pXG5cbi8vIFRvYXN0IEFQSVxuZXhwb3J0IGNvbnN0IHRvYXN0ID0ge1xuICBzdWNjZXNzOiAobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbiA9IDMwMDApID0+IHtcbiAgICBjb25zdCBpZCA9IERhdGUubm93KCkudG9TdHJpbmcoKVxuICAgIHRvYXN0cy52YWx1ZSA9IFsuLi50b2FzdHMudmFsdWUsIHsgaWQsIHR5cGU6ICdzdWNjZXNzJywgbWVzc2FnZSwgZHVyYXRpb24gfV1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRvYXN0cy52YWx1ZSA9IHRvYXN0cy52YWx1ZS5maWx0ZXIodCA9PiB0LmlkICE9PSBpZClcbiAgICB9LCBkdXJhdGlvbilcbiAgfSxcbiAgXG4gIGVycm9yOiAobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbiA9IDQwMDApID0+IHtcbiAgICBjb25zdCBpZCA9IERhdGUubm93KCkudG9TdHJpbmcoKVxuICAgIHRvYXN0cy52YWx1ZSA9IFsuLi50b2FzdHMudmFsdWUsIHsgaWQsIHR5cGU6ICdlcnJvcicsIG1lc3NhZ2UsIGR1cmF0aW9uIH1dXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0b2FzdHMudmFsdWUgPSB0b2FzdHMudmFsdWUuZmlsdGVyKHQgPT4gdC5pZCAhPT0gaWQpXG4gICAgfSwgZHVyYXRpb24pXG4gIH0sXG4gIFxuICBpbmZvOiAobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbiA9IDMwMDApID0+IHtcbiAgICBjb25zdCBpZCA9IERhdGUubm93KCkudG9TdHJpbmcoKVxuICAgIHRvYXN0cy52YWx1ZSA9IFsuLi50b2FzdHMudmFsdWUsIHsgaWQsIHR5cGU6ICdpbmZvJywgbWVzc2FnZSwgZHVyYXRpb24gfV1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRvYXN0cy52YWx1ZSA9IHRvYXN0cy52YWx1ZS5maWx0ZXIodCA9PiB0LmlkICE9PSBpZClcbiAgICB9LCBkdXJhdGlvbilcbiAgfVxufVxuXG4vLyBUb2FzdCBDb250YWluZXIgQ29tcG9uZW50XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUb2FzdENvbnRhaW5lcigpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwiZml4ZWQgdG9wLTQgcmlnaHQtNCB6LTUwIHNwYWNlLXktMlwiPlxuICAgICAge3RvYXN0cy52YWx1ZS5tYXAodG9hc3QgPT4gKFxuICAgICAgICA8VG9hc3RJdGVtIGtleT17dG9hc3QuaWR9IHRvYXN0PXt0b2FzdH0gLz5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIEluZGl2aWR1YWwgVG9hc3QgQ29tcG9uZW50XG5mdW5jdGlvbiBUb2FzdEl0ZW0oeyB0b2FzdDogdG9hc3RJdGVtIH06IHsgdG9hc3Q6IFRvYXN0TWVzc2FnZSB9KSB7XG4gIGNvbnN0IGJnQ29sb3IgPSB7XG4gICAgc3VjY2VzczogJ2JnLWZsYW1pbmdvLXB1cnBsZS85MCB0ZXh0LXdoaXRlJyxcbiAgICBlcnJvcjogJ2JnLWZsYW1pbmdvLWNvcmFsLzkwIHRleHQtd2hpdGUnLCBcbiAgICBpbmZvOiAnYmctZmxhbWluZ28tY2hhcmNvYWwvOTAgdGV4dC13aGl0ZSdcbiAgfVxuICBcbiAgY29uc3QgaWNvbiA9IHtcbiAgICBzdWNjZXNzOiAn4pyFJyxcbiAgICBlcnJvcjogJ+KdjCcsXG4gICAgaW5mbzogJ+KEue+4jydcbiAgfVxuICBcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPXtgXG4gICAgICAke2JnQ29sb3JbdG9hc3RJdGVtLnR5cGVdfVxuICAgICAgcHgtNCBweS0zIHJvdW5kZWQtY2h1bmt5IGJvcmRlci0zIGJvcmRlci13aGl0ZS8yMFxuICAgICAgZm9udC1jaHVua3kgdGV4dC1zbSB0cmFja2luZy13aWRlXG4gICAgICB0cmFuc2Zvcm0gYW5pbWF0ZS1zbGlkZS1pbi1yaWdodFxuICAgICAgYmFja2Ryb3AtYmx1ci1zbSBzaGFkb3ctbGdcbiAgICAgIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXG4gICAgICBtYXgtdy1zbVxuICAgIGB9PlxuICAgICAgPHNwYW4+e2ljb25bdG9hc3RJdGVtLnR5cGVdfTwvc3Bhbj5cbiAgICAgIDxzcGFuPnt0b2FzdEl0ZW0ubWVzc2FnZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gIClcbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFNBQVMsTUFBTSxRQUFRLGtCQUFpQjtBQVd4QyxNQUFNLFNBQVMsT0FBdUIsRUFBRTtBQUV4QyxZQUFZO0FBQ1osT0FBTyxNQUFNLFFBQVE7RUFDbkIsU0FBUyxDQUFDLFNBQWlCLFdBQVcsSUFBSTtJQUN4QyxNQUFNLEtBQUssS0FBSyxHQUFHLEdBQUcsUUFBUTtJQUM5QixPQUFPLEtBQUssR0FBRztTQUFJLE9BQU8sS0FBSztNQUFFO1FBQUU7UUFBSSxNQUFNO1FBQVc7UUFBUztNQUFTO0tBQUU7SUFDNUUsV0FBVztNQUNULE9BQU8sS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBLElBQUssRUFBRSxFQUFFLEtBQUs7SUFDbkQsR0FBRztFQUNMO0VBRUEsT0FBTyxDQUFDLFNBQWlCLFdBQVcsSUFBSTtJQUN0QyxNQUFNLEtBQUssS0FBSyxHQUFHLEdBQUcsUUFBUTtJQUM5QixPQUFPLEtBQUssR0FBRztTQUFJLE9BQU8sS0FBSztNQUFFO1FBQUU7UUFBSSxNQUFNO1FBQVM7UUFBUztNQUFTO0tBQUU7SUFDMUUsV0FBVztNQUNULE9BQU8sS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBLElBQUssRUFBRSxFQUFFLEtBQUs7SUFDbkQsR0FBRztFQUNMO0VBRUEsTUFBTSxDQUFDLFNBQWlCLFdBQVcsSUFBSTtJQUNyQyxNQUFNLEtBQUssS0FBSyxHQUFHLEdBQUcsUUFBUTtJQUM5QixPQUFPLEtBQUssR0FBRztTQUFJLE9BQU8sS0FBSztNQUFFO1FBQUU7UUFBSSxNQUFNO1FBQVE7UUFBUztNQUFTO0tBQUU7SUFDekUsV0FBVztNQUNULE9BQU8sS0FBSyxHQUFHLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBLElBQUssRUFBRSxFQUFFLEtBQUs7SUFDbkQsR0FBRztFQUNMO0FBQ0YsRUFBQztBQUVELDRCQUE0QjtBQUM1QixlQUFlLFNBQVM7RUFDdEIscUJBQ0UsS0FBQztJQUFJLE9BQU07Y0FDUixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQSxzQkFDaEIsS0FBQztRQUF5QixPQUFPO1NBQWpCLE1BQU0sRUFBRTs7QUFJaEM7QUFFQSw2QkFBNkI7QUFDN0IsU0FBUyxVQUFVLEVBQUUsT0FBTyxTQUFTLEVBQTJCO0VBQzlELE1BQU0sVUFBVTtJQUNkLFNBQVM7SUFDVCxPQUFPO0lBQ1AsTUFBTTtFQUNSO0VBRUEsTUFBTSxPQUFPO0lBQ1gsU0FBUztJQUNULE9BQU87SUFDUCxNQUFNO0VBQ1I7RUFFQSxxQkFDRSxNQUFDO0lBQUksT0FBTyxDQUFDO01BQ1gsRUFBRSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQzs7Ozs7OztJQU81QixDQUFDOztvQkFDQyxLQUFDO2tCQUFNLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQzs7b0JBQzNCLEtBQUM7a0JBQU0sVUFBVSxPQUFPOzs7O0FBRzlCIn0=
// denoCacheMetadata=13627362982945605683,10374871529528474090