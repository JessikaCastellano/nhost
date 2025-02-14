import Button from '@/ui/v2/Button';
import { useDropdown } from '@/ui/v2/Dropdown';
import type { InputProps } from '@/ui/v2/Input';

import { format, set } from 'date-fns';

import Input from '@/ui/v2/Input';

export interface LogTimePickerProps extends InputProps {
  /**
   * The upper bound (a day) in the allowed range that can be selected for the date picker.
   */
  maxDate?: Date;
}

const TIMEPICKER_STEP = 1;

function LogsTimePicker({
  selectedDate,
  setSelectedDate,
  onChange,
  maxDate,
}: any) {
  const { handleClose } = useDropdown();

  const handleCancel = () => {
    handleClose();
  };

  const handleApply = () => {
    onChange(selectedDate);
    handleClose();
  };

  const handleTimePicking = (event) => {
    const [hours, minutes, seconds] = event.target.value.split(':');

    const hoursNumber = parseInt(hours, 10);
    const minutesNumber = parseInt(minutes, 10);
    const secondsNumber = parseInt(seconds, 10);

    const newDate = set(new Date(selectedDate), {
      hours: hoursNumber,
      minutes: minutesNumber,
      seconds: secondsNumber,
    });

    // if the new date is a date surpassing the the max allowed date (that is, the `toDate`)
    // we don't allow the user to select set it.
    if (newDate > maxDate) {
      return;
    }

    setSelectedDate(newDate);
  };

  return (
    <div className="grid items-center self-center grid-flow-row mx-auto">
      <div className="border border-[#EAEDF0] px-4 py-2">
        <Input
          value={format(selectedDate, 'HH:mm:ss')}
          style={{ width: '135px' }}
          id="time-picker"
          componentsProps={{
            formControl: {
              className: 'grid grid-flow-col gap-x-3',
            },
            label: { sx: { fontSize: '14px' } },
          }}
          onChange={handleTimePicking}
          type="time"
          label="Select Time"
          sx={{
            '& [type=time]': {
              lineHeight: '1.375rem',
              fontWeight: 500,
              color: (theme) => theme.palette.text.primary,
              backgroundColor: 'transparent',
              padding: (theme) => theme.spacing(0.75, 3.75),
            },
          }}
          fullWidth
          inputProps={{
            step: TIMEPICKER_STEP,
          }}
        />
      </div>
      <div className="grid justify-end grid-flow-col px-4 py-2 gap-x-4">
        <Button variant="outlined" color="secondary" onClick={handleCancel}>
          Cancel
        </Button>

        <Button variant="contained" color="primary" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}

export default LogsTimePicker;
