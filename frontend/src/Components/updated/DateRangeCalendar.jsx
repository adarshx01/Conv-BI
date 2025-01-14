import React, { useState, useEffect } from 'react';

const DateRangeCalendar = ({ onDateRangeChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [isSelecting, setIsSelecting] = useState(false);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (!isSelecting || !selectedRange.start) {
      setSelectedRange({ start: clickedDate, end: null });
      setIsSelecting(true);
    } else {
      if (clickedDate < selectedRange.start) {
        setSelectedRange({ start: clickedDate, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: clickedDate });
      }
      setIsSelecting(false);
      onDateRangeChange({
        start: formatDate(clickedDate < selectedRange.start ? clickedDate : selectedRange.start),
        end: formatDate(clickedDate < selectedRange.start ? selectedRange.start : clickedDate)
      });
    }
  };

  const isInRange = (day) => {
    if (!selectedRange.start || !day) return false;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    if (!selectedRange.end) return date.getTime() === selectedRange.start.getTime();
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add week days header
    const weekDaysRow = weekDays.map(day => (
      <div key={day} className="w-10 h-5 flex items-center justify-center font-medium text-gray-400 text-sm">
        {day}
      </div>
    ));
    days.push(
      <div key="weekdays" className="grid grid-cols-7 mb-2">
        {weekDaysRow}
      </div>
    );

    let weeks = [];
    let week = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      week.push(
        <div key={`empty-${i}`} className="w-10 h-5" />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isInRange(day);
      week.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`w-10 h-5 flex items-center justify-center cursor-pointer rounded-full text-sm
            ${isSelected ? 'bg-blue-500 text-white font-semibold' : 'hover:bg-gray-100'}
            ${isSelected && 'transition-colors duration-200'}
            ${isToday(day) && !isSelected ? 'border border-blue-500' : ''}
          `}
        >
          {day}
        </div>
      );

      if ((day + firstDay) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7">
            {week}
          </div>
        );
        week = [];
      }
    }

    days.push(...weeks);
    return days;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-72">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="font-semibold text-lg">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div>{renderCalendar()}</div>
      <div className="mt-4 text-sm text-gray-600 font-medium">
        {selectedRange.start && (
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>
              {formatDate(selectedRange.start)} 
              {selectedRange.end ? ` - ${formatDate(selectedRange.end)}` : ' (selecting end date...)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeCalendar;

