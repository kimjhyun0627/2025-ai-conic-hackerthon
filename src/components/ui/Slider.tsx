import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  unit?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      showValue = true,
      unit = '',
      value,
      min = 0,
      max = 100,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </label>
            {showValue && (
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {value}
                {unit}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          value={value}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;
