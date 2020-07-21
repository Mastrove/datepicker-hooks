import React, { useState } from 'react';
import { useDatePicker, ActiveSelection } from './datePicker';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function DatePicker() {
  const {
    firstDayOfWeek,
    activeMonths,
    isDateFocused,
    focusedDate,
    onDateHover,
    onDateSelect,
    activeSelection,
    getInputProps,
    getDateProps,
    movePickerBy,
    weekdayLabels,
  } = useDatePicker({
    startDate: new Date(),
    // endDate: new Date('2018-11-11'),
    onDatesChange: () => {},
    numberOfMonths: 3,
    firstDayOfWeek: 0,
  });

  return (
    <div>
      <div>
        <strong>Focused input: </strong>
        {activeSelection}
      </div>
      <div>
        <strong>Start date: </strong>
        <input
          type="text"
          {...getInputProps(ActiveSelection.start)}
          style={{
            borderBottomColor: activeSelection === ActiveSelection.start ? 'red' : 'inherit',
            marginBottom: 10,
          }}
        />
      </div>
      <div>
        <strong>End date: </strong>
        <input
          type="text"
          {...getInputProps(ActiveSelection.end)}
          style={{
            borderBottomColor: activeSelection === ActiveSelection.end ? 'red' : 'inherit',
          }}
        />
      </div>

      <button type="button" onClick={() => movePickerBy(-1)}>
        {'<'}
      </button>
      <button type="button" onClick={() => movePickerBy(1)}>
        {'>'}
      </button>
      <div
        style={{
          display: 'grid',
          margin: '32px 0 0',
          gridTemplateColumns: `repeat(${activeMonths.length}, 300px)`,
          gridGap: '0 64px',
        }}
      >
        {activeMonths.map((month, index) => (
          <div key={index}>
            <div style={{ textAlign: 'center', margin: '0 0 16px' }}>
              <strong>
                {months[month.month.index]}
                {'  '}
                {month.month.year}
              </strong>
              {/* <select name="monthPicker" id="">
              {months.map()}
            </select> */}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                justifyContent: 'center',
              }}
            >
              {weekdayLabels.map((dayLabel: any) => (
                <div style={{ textAlign: 'center' }} key={dayLabel}>
                  {dayLabel}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                justifyContent: 'center',
              }}
            >
              {month.month.getDays().map((day, index) => {
                const {
                  isInSelectedRange,
                  isStartDate,
                  isEndDate,
                  potentialRange,
                  props,
                } = getDateProps(day.day);
                return (
                  <button
                    key={index}
                    {...props}
                    type="button"
                    style={{
                      color:
                        isInSelectedRange ||
                        isStartDate ||
                        isEndDate ||
                        potentialRange.isWithinRange
                          ? 'white'
                          : day.isPadding
                          ? 'grey'
                          : 'black',
                      background:
                        isInSelectedRange || isStartDate || isEndDate
                          ? 'blue'
                          : potentialRange.isWithinRange
                          ? 'green'
                          : 'white',
                    }}
                  >
                    {day.day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DatePicker;
